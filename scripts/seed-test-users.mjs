/**
 * Seed 8 verified Luther College test accounts plus a mix of DRIVER and
 * PASSENGER feed posts so you can exercise the app end-to-end on a phone.
 *
 * Usage (from project root):
 *     cd scripts
 *     npm install            # first time only
 *     npm run seed           # creates / refreshes the test users + posts
 *     npm run wipe           # removes them again
 *
 * Connection + JWT settings come from ../.env (same file the Spring app uses).
 */
import "dotenv/config";
import { Client } from "pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load the project-root .env so DB_URL / DB_USERNAME / DB_PASSWORD are picked
// up no matter where the script is run from.
import dotenv from "dotenv";
dotenv.config({ path: resolve(__dirname, "..", ".env") });

const PASSWORD = "Test1234!"; // single shared password for every seeded account
const SCHOOL = "Luther College";

// 8 fixture users. Phone numbers are bogus 555 area-code placeholders.
const USERS = [
  { name: "Avery Hansen",    email: "avery.hansen01@luther.edu",    dob: "2003-04-12", grad: "2026-05-10", phone: 15551112201 },
  { name: "Briana Olson",    email: "briana.olson02@luther.edu",    dob: "2002-09-30", grad: "2025-12-15", phone: 15551112202 },
  { name: "Caleb Iverson",   email: "caleb.iverson03@luther.edu",   dob: "2004-01-22", grad: "2027-05-12", phone: 15551112203 },
  { name: "Dana Knutson",    email: "dana.knutson04@luther.edu",    dob: "2003-07-08", grad: "2026-05-10", phone: 15551112204 },
  { name: "Eli Pederson",    email: "eli.pederson05@luther.edu",    dob: "2002-11-19", grad: "2025-05-11", phone: 15551112205 },
  { name: "Freya Larson",    email: "freya.larson06@luther.edu",    dob: "2004-03-04", grad: "2027-05-12", phone: 15551112206 },
  { name: "Gus Mickelson",   email: "gus.mickelson07@luther.edu",   dob: "2003-06-25", grad: "2026-05-10", phone: 15551112207 },
  { name: "Hana Thompson",   email: "hana.thompson08@luther.edu",   dob: "2002-12-02", grad: "2025-12-15", phone: 15551112208 },
];

// 4 ride offers (DRIVER) and 4 ride requests (PASSENGER), staggered into the
// next 10 days so they pass any "future departure" checks.
function plusHours(h) {
  return new Date(Date.now() + h * 3600_000).toISOString().slice(0, 19).replace("T", " ");
}
const POSTS = [
  // DRIVER posts — offering a ride
  { idx: 0, postType: "DRIVER",    origin: "Decorah, IA",    destination: "Minneapolis, MN", price: 25.00, seats: 3, departure: plusHours(36),  vehicle: "Silver Toyota Camry", description: "Leaving Friday after lab. One stop for gas." },
  { idx: 2, postType: "DRIVER",    origin: "Decorah, IA",    destination: "Madison, WI",     price: 30.00, seats: 2, departure: plusHours(72),  vehicle: "Blue Subaru Outback", description: "Heading home for the weekend." },
  { idx: 4, postType: "DRIVER",    origin: "Decorah, IA",    destination: "Chicago, IL",     price: 45.00, seats: 4, departure: plusHours(120), vehicle: "White Honda Civic",   description: "Roomy hatch, dog-friendly." },
  { idx: 6, postType: "DRIVER",    origin: "Decorah, IA",    destination: "Rochester, MN",   price: 18.00, seats: 2, departure: plusHours(28),  vehicle: "Black Ford Escape",   description: "Quick run, back same night." },
  // PASSENGER posts — looking for a ride
  { idx: 1, postType: "PASSENGER", origin: "Decorah, IA",    destination: "Des Moines, IA",  price:  0.00, seats: 1, departure: plusHours(48),  vehicle: null, description: "Need a ride for spring visit, can chip in for gas." },
  { idx: 3, postType: "PASSENGER", origin: "Decorah, IA",    destination: "Minneapolis, MN", price:  0.00, seats: 1, departure: plusHours(60),  vehicle: null, description: "Flying out of MSP at 6pm — happy to leave by noon." },
  { idx: 5, postType: "PASSENGER", origin: "Minneapolis, MN", destination: "Decorah, IA",    price:  0.00, seats: 2, departure: plusHours(96),  vehicle: null, description: "Coming back to campus, two of us." },
  { idx: 7, postType: "PASSENGER", origin: "Decorah, IA",    destination: "Milwaukee, WI",   price:  0.00, seats: 1, departure: plusHours(144), vehicle: null, description: "Open on timing, anytime that weekend works." },
];

function uniqueSpecialNumber(used) {
  // Mirrors ProfileController.numberGenerator() — any 4-digit int [1000, 9999].
  while (true) {
    const n = 1000 + Math.floor(Math.random() * 9000);
    if (!used.has(n)) {
      used.add(n);
      return n;
    }
  }
}

function buildUsername(name, dob, specialNumber) {
  // Mirrors ProfileController.generateUsername(): first.last_YYYY_NNNN, lowercased.
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.length ? rest[rest.length - 1] : "user";
  const year = dob.slice(0, 4);
  return `${first}.${last}_${year}_${specialNumber}`.toLowerCase();
}

async function getClient() {
  const rawUrl = process.env.DB_URL || process.env.SPRING_DATASOURCE_URL;
  const user = process.env.DB_USERNAME || process.env.SPRING_DATASOURCE_USERNAME;
  const password = process.env.DB_PASSWORD || process.env.SPRING_DATASOURCE_PASSWORD;
  if (!rawUrl || !user || !password) {
    throw new Error("DB_URL / DB_USERNAME / DB_PASSWORD must be set (see ../.env).");
  }
  // The Spring app uses a JDBC URL; pg wants a plain URI.
  // jdbc:postgresql://host:port/db?sslmode=require  →  postgres://user:pass@host:port/db?sslmode=require
  const m = rawUrl.match(/^jdbc:postgresql:\/\/([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!m) throw new Error(`Unrecognized DB_URL: ${rawUrl}`);
  const host = m[1];
  const path = m[2] || "/postgres";
  // Pass discrete options (not a connection string): newer pg upgrades
  // sslmode=require to verify-full and rejects Supabase's chain.
  const [hostname, port] = host.split(":");
  const client = new Client({
    host: hostname,
    port: port ? Number(port) : 5432,
    user,
    password,
    database: path.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function wipe(client) {
  // Remove only the seeded fixtures, identified by the luther.edu emails above.
  const emails = USERS.map((u) => u.email);
  await client.query(`DELETE FROM feeds WHERE email = ANY($1::text[])`, [emails]);
  await client.query(`DELETE FROM profiles WHERE email = ANY($1::text[])`, [emails]);
  console.log(`wiped ${emails.length} seeded profiles (+ their feed posts).`);
}

async function seed(client) {
  await wipe(client); // idempotent — clear any prior run first

  const usedNumbers = new Set();
  const profiles = [];

  for (const u of USERS) {
    const special = uniqueSpecialNumber(usedNumbers);
    const username = buildUsername(u.name, u.dob, special);
    // BCryptPasswordEncoder default = $2a$10$… ; bcryptjs salt(10) is compatible.
    const hash = await bcrypt.hash(PASSWORD, 10);

    await client.query(
      `INSERT INTO profiles
         (id, name, user_special_number, username, email, dob, school,
          graduation_date, phone_number, password, email_verified, token_version, driver_verified)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5::date, $6, $7::date, $8, $9, true, 0, false)`,
      [u.name, special, username, u.email, u.dob, SCHOOL, u.grad, u.phone, hash],
    );

    profiles.push({ username, email: u.email });
    console.log(`  +profile ${username}  <${u.email}>`);
  }

  for (const p of POSTS) {
    const author = profiles[p.idx];
    await client.query(
      `INSERT INTO feeds
         (id, username, email, origin, destination, price, seats,
          departure_time, vehicle_info, description, post_type, created_at, updated_at)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6,
          $7::timestamp, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        author.username,
        author.email,
        p.origin,
        p.destination,
        p.price,
        p.seats,
        p.departure,
        p.vehicle,
        p.description,
        p.postType,
      ],
    );
    console.log(`  +${p.postType.padEnd(9)} ${author.username}: ${p.origin} → ${p.destination}`);
  }

  console.log("");
  console.log("done. log in with any of these on your phone:");
  for (const u of USERS) {
    console.log(`  email: ${u.email}   password: ${PASSWORD}`);
  }
}

const args = new Set(process.argv.slice(2));
const client = await getClient();
try {
  if (args.has("--wipe")) {
    await wipe(client);
  } else {
    await seed(client);
  }
} finally {
  await client.end();
}
