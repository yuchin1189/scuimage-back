import passport from 'passport'
import passportLocal from 'passport-local'
import User from './models/user.js'
import bcrypt from 'bcrypt'
import passportJWT from 'passport-jwt'

passport.use(
  'login',
  new passportLocal.Strategy(async (username, password, done) => {
    try {
      // 查詢對應 username 是否存在
      // 若有的話 user 會宣告為正確的使用者帳號
      // 若無則此處的 user 會宣告成 null
      const user = await User.findOne({ username: username }).orFail(new Error('USERNAME'))
      // 比對該使用者的密碼（因為有加密，需使用 bcrypt 的方式比對）
      if (!bcrypt.compareSync(password, user.password)) {
        throw new Error('PASSWORD')
      }
      return done(null, user, null) // 呼叫 done() 的時候，資料會回到 auth.js 繼續往下走
    } catch (error) {
      console.log('passport.js login error', error)
      if (error.message === 'USERNAME') {
        return done(null, null, { message: 'userNotFound' })
      } else if (error.message === 'PASSWORD') {
        return done(null, null, { message: 'userPasswordIncorrect' })
      } else {
        return done(null, null, { message: 'serverError' })
      }
    }
  }),
)

passport.use(
  'jwt',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
      ignoreExpiration: true,
    },
    async (req, payload, done) => {
      try {
        const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        const expired = payload.exp * 1000 < new Date().getTime()
        const url = req.baseUrl + req.path
        if (expired && url !== '/user/refresh' && url !== '/user/logout') {
          throw new Error('EXPIRED')
        }

        const user = await User.findById(payload._id).orFail(new Error('USER'))
        if (!user.tokens.includes(token)) {
          throw new Error('TOKEN')
        }
        return done(null, { user, token }, null)
      } catch (error) {
        console.log('passport.js jwt error', error)
        if (error.message === 'USER') {
          return done(null, null, { message: 'userNotFound' })
        } else if (error.message === 'TOKEN') {
          return done(null, null, { message: 'userTokenInvalid' })
        } else if (error.message === 'EXPIRED') {
          return done(null, null, { message: 'userTokenExpired' })
        } else {
          return done(null, null, { message: 'serverError' })
        }
      }
    },
  ),
)
