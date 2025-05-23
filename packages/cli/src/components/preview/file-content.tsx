import { ScrollArea } from "@/components/ui/scroll-area";

const VARIABLES = {
  NEXT_PUBLIC_USERNAME: "John Doe",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  NEXT_PUBLIC_API_KEY: "1234567890",
  NEXT_PUBLIC_SECRET_KEY: "1234567890",
  DATABASE_URL: "postgresql://user:password@localhost:5432/mydb",
  REDIS_URL: "redis://localhost:6379",
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  STRIPE_SECRET_KEY: "sk_test_51HxEXAMPLE",
  STRIPE_WEBHOOK_SECRET: "whsec_51HxEXAMPLE",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
  SMTP_USER: "user@gmail.com",
  SMTP_PASSWORD: "app-specific-password",
  JWT_SECRET: "your-super-secret-jwt-key",
  CLOUDINARY_CLOUD_NAME: "your-cloud-name",
  CLOUDINARY_API_KEY: "your-api-key",
  CLOUDINARY_API_SECRET: "your-api-secret",
  SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
  GOOGLE_ANALYTICS_ID: "UA-XXXXXXXXX-X",
  FACEBOOK_APP_ID: "123456789012345",
  FACEBOOK_APP_SECRET: "abcdef1234567890abcdef1234567890",
  TWITTER_API_KEY: "your-twitter-api-key",
  TWITTER_API_SECRET: "your-twitter-api-secret",
};

export const FileContent = () => {
  return (
    <ScrollArea className="w-full h-full grow bg-muted rounded-md p-4 px-5">
      <div className="flex flex-col font-mono text-sm">
        {Object.entries(VARIABLES).map(([key, value]) => (
          <span key={key} className="text-muted-foreground">
            {`${key}="${value}"`}
          </span>
        ))}

        {Object.entries(VARIABLES).map(([key, value]) => (
          <span key={key} className="text-destructive">{`${key}=`}</span>
        ))}
      </div>
    </ScrollArea>
  );
};
