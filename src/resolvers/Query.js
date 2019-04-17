const { getUserId } = require('./../utils')

function user(parent, args, ctx, info) {
  const userId = getUserId(ctx)
  return ctx.db.query.user({ where: { id: userId } }, info)
}

module.exports = {
  user
}