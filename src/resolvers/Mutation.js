const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const JWT_SECRET = process.env.JWT_SECRET
const { getUserId } = require('./../utils')



function createAccount(_, args, ctx, info) {
  const userId = getUserId(ctx)
  return ctx.db.mutation.createAccount({
    data: {
      description: args.description,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info)
}

function createCategory(_, { description, operation }, ctx, info) {
  const userId = getUserId(ctx)
  return ctx.db.mutation.createCategory({
    data: {
      description,
      operation,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info)
}

function createRecord(_, args, ctx, info) {
 
  const date = moment(args.date)
  if(!date.isValid()){
    throw new Error('Invalid date!')
  }
 
  let {amount , type} = args
  if(
    (type === 'DEBIT' && amount > 0 ) ||
    (type === 'CREDIT' && amount < 0)
  ){
    amount = -amount
  }

  const userId = getUserId(ctx)
  return ctx.db.mutation.createRecord({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      account: {
        connect: {
          id: args.accountId
        }
      },
      category: {
        connect: {
          id: args.categoryId
        }
      },
      amount,
      type,
      date: args.date,
      description: args.description,
      tags: args.tags,
      note: args.note
      // poderia trocar os operadores por ...args
    }
  }, info)
}

async function login(_, { email, password }, ctx, info) {

  const user = await ctx.db.query.user({ where: { email } })
  if (!user) {
    throw new Error('Invalid credentials !')
  }
  console.log('User ', user)
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new Error('Invalid credentials !')
  }

  const token = jwt.sign({ userId: user.id },
    JWT_SECRET,
    { expiresIn: '2h' })

  return {
    token,
    user
  }

}


async function signup(_, args, ctx, info) {

  const password = await bcrypt.hash(args.password, 10)
  const user = await ctx.db.mutation.createUser({
    data: {
      ...args, password
    }
  })

  const token = jwt.sign({ userId: user.id },
    JWT_SECRET,
    { expiresIn: '2h' })

  return {
    token,
    user
  }

}

module.exports = {
  createAccount,
  createCategory,
  createRecord,
  login,
  signup
}