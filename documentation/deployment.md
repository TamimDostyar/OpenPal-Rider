# Deployment and Configuration

## Local development

- Run: ./gradlew bootRun
- Build: ./gradlew build

## Docker

- Build and run: docker compose up --build
- Exposed port: 8000

Notes:
- The Dockerfile uses Maven commands, but this repo is Gradle-based. Container builds will likely fail unless the Dockerfile is updated to use Gradle.
- The compose file includes a PostgreSQL example service, but it is commented out.

## Environment variables

Database (PostgreSQL):
- DB_URL
- DB_USERNAME
- DB_PASSWORD

Email (SMTP via Gmail):
- MAIL_USERNAME
- MAIL_PASSWORD

Other:
- openpal.mail.from defaults to MAIL_USERNAME when set

## Data resources

- data/us_universities.csv is bundled with the app and loaded at runtime.
