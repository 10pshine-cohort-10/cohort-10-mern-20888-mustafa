import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, (error) => {
  const port = env.PORT;
  if (error) {
    console.error(`Error starting server on port ${port}:`, error);
    process.exit(1);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});
