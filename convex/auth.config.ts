export default {
  providers: [
    {
      // Convex reads this from deployment env, not the Vite client env.
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: 'convex',
    },
  ],
};
