// config/jwt.js
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
if (!jwtConfig.secret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
export default jwtConfig;
