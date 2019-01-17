const { forwardTo } = require('prisma-binding');

const { hasPermission } = require('../utils');

const Query = {
  // When the Yoga implementation is the same as Prisma and there is no auth,
  // filtering, etc. to be done, we can just used `forwardto` rather than writing
  // the resolver ourselves like below.
  items: forwardTo('db'),
  // async items(parent, args, ctx, info) {
  //   return await ctx.db.query.items();
  // },

  item: forwardTo('db'),

  itemsConnection: forwardTo('db'),

  async users(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    const user = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    );

    // console.log('ctx.request.user', ctx.request.user);
    // Check if they have permission to query users.
    // Will throw an error if not.
    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.query.users({}, info);
  },

  me(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (!userId) {
      // Return `null` in this case rather than an error incase the user isn't logged in
      return null;
    }

    return ctx.db.query.user(
      {
        where: { id: userId },
      },
      info,
    );
  },

  async order(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (!userId) {
      throw new Error('You must be logged in to view this order');
    }

    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info,
    );
    console.log('order', order);

    if (order.user.id !== userId) {
      throw new Error('You do not have permission to view this order.');
    }

    return order;
  },

  orders(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (!userId) {
      throw new Error('You must be logged in to view orders');
    }

    return ctx.db.query.orders(
      {
        where: { user: { id: userId } },
      },
      info,
    );
  },
};

module.exports = Query;
