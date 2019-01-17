const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { createEmail, transport } = require('../email');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

async function createToken(ctx, userId) {
  const token = await jwt.sign({ userId }, process.env.APP_SECRET);

  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365, // One year
  });

  return token;
}

module.exports = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to sell!');
    }

    const { userId } = ctx.request;
    const user = await ctx.db.query.user({
      where: { id: userId },
    });

    return ctx.db.mutation.createItem(
      {
        data: {
          ...args,
          user: {
            // This is how we create a relationship between the item and user
            connect: {
              id: userId,
            },
            // ...user,
            // resetToken: null,
            // resetTokenExpiry: null,
          },
        },
      },
      info, // Always include `info` so it knows what to return to the client
    );
  },

  updateItem(parent, args, ctx, info) {
    // TODO: Check if user is logged in

    const updates = { ...args };

    // Remove the ID as this is not editable
    delete updates.id;

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id },
      },
      info,
    );
  },

  async deleteItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to delete items');
    }

    // 1. Find the item
    const item = await ctx.db.query.item(
      {
        where: { id: args.id },
      },
      `{
         id
         user {
           id
         }
       }`,
    );

    if (!item) {
      throw new Error('Item no longer exists!');
    }

    const user = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      `{
         id
         permissions
       }`,
    );

    // 2. Check user has permission to delete and owns item
    const hasPermissions = user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission),
    );

    const ownsItem = item.user.id === user.id;

    if (!hasPermissions) {
      throw new Error('You do not have authorization to delete items');
    }

    if (!ownsItem) {
      throw new Error('You may not delete items you do not own');
    }

    // 3. Delete item
    return ctx.db.mutation.deleteItem({ where: { id: args.id } }, info);
  },

  async signup(parent, args, ctx, info) {
    const { email, name, password } = args;

    const lowerCasedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          email: lowerCasedEmail,
          name,
          password: passwordHash,
          permissions: {
            set: ['USER'],
          },
        },
      },
      info,
    );

    createToken(ctx, user.id);

    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error(`No such user found!`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password!');
    }

    createToken(ctx, user.id);

    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token'); // This is a method made available from 'cookie-parser' package
    return { message: 'Logged out successfully!' };
  },

  /**
   * 1. Ensure an account with provided email exists
   * 2. Create a reset token
   * 3. Update the user
   * 4. Send them an email with link to reset
   */
  async requestPasswordReset(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({
      where: { email },
    });

    if (!user) {
      throw new Error('No account found!');
    }

    const randomBytesPromise = promisify(randomBytes);
    const resetToken = (await randomBytesPromise(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await transport.sendMail({
      from: 'support@sickfits.com',
      to: user.email,
      subject: 'Your password reset',
      html: createEmail(`
      Your password reset token has been created! 
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?token=${resetToken}">
      Click here to reset your password</a>`),
    });

    return {
      message:
        'Check your email for instructions on how to reset your password!',
    };
  },

  async resetPassword(parent, args, ctx, info) {
    const { confirmPassword, password } = args;

    if (confirmPassword !== password) {
      throw new Error('Passwords do not match!');
    }

    // We don't have the email of ID available to us, so we'll check against the resetToken.
    // At the same time, we'll check against the expiry date and return the first user found.
    // If nothing matches both criteria, we know that the token doesn't exist or the token
    // is expired as nothing will be returned.
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });

    if (!user) {
      throw new Error('Your token is either invalid or expired');
    }

    // Set a new password based on what they entered into the form
    const newPasswordHash = await bcrypt.hash(password, 10);

    const updatedUser = await ctx.db.mutation.updateUser(
      {
        where: { id: user.id },
        data: {
          password: newPasswordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      },
      info,
    );

    // Now that the user is updated, set a new token on the cookie
    createToken(ctx, updatedUser.id);

    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to update a user');
    }

    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    );

    console.log('currentUser', currentUser);
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.id,
        },
      },
      info,
    );
  },

  async addToCart(parent, args, ctx, info) {
    // Make sure user is logged in
    if (!ctx.request.userId) {
      throw new Error('Please log in to add items to your cart');
    }

    const { userId } = ctx.request;
    const { id: itemId } = args;

    // Query user's current cart. We're using the plural query because we don't know
    // the ID of the cart item and there will only every be a cart item that
    // belongs to a single user's cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: itemId },
      },
    });

    // Check if that item is already in their cart and increment by 1 if so.
    // If not, create a new CartItem for the user
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
      });
    }

    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: itemId },
        },
      },
    });
  },

  async removeFromCart(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to remove items from the cart');
    }

    const { userId } = ctx.request;

    const cartItem = await ctx.db.query.cartItem(
      {
        where: { id: args.id },
      },
      `{
        id
        user {
          id
        }
     }`,
    );

    if (!cartItem) {
      throw new Error('This item has already been removed!');
    }

    if (cartItem.user.id !== userId) {
      throw new Error('You are not allowed to modify this cart!');
    }

    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info,
    );
  },

  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in to complete this order.');
    }

    const user = await ctx.db.query.user(
      {
        where: { id: userId },
      },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            id
            title
            price
            description
            image
            largeImage
          }
        }
      }`,
    );

    // If the item was deleted, we won't be able to create `orderItem`s with it
    const cartItems = user.cart.filter(
      cartItem => cartItem.item !== null && cartItem.item !== undefined,
    );

    // 1. Recalculate total for price (we don't want to take what the client
    //    gives us incase someone tries something funny)
    const amount = cartItems.reduce(
      (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
      0,
    );

    // 2. Create stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });

    // 3. Convert the CartItems to OrderItems
    const orderItems = cartItems.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: {
          connect: {
            id: user.id,
          },
        },
      };

      // We don't want a relationship between an orderItem and the item, so we need to delete the ID
      delete orderItem.id;
      return orderItem;
    });
    console.log('orderItems', orderItems);

    // 4. Create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: {
          create: orderItems,
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    console.log('created order', order);

    // 5. Clean up - clear the user's cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);

    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });

    // 6. Return the Order to the client (required by Stripe)
    return order;
  },
};
