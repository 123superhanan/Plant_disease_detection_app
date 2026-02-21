import { sql } from '../../config/db.js';

// export async function getOrCreateUser(clerkId) {
//   console.log('getOrCreateUser called for clerkId:', clerkId);

//   try {
//     const existing = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;
//     console.log('Existing query rows:', existing.length);

//     if (existing.length > 0) {
//       return existing[0];
//     }

//     console.log('Creating new user');
//     const inserted = await sql`
//       INSERT INTO users (clerk_id)
//       VALUES (${clerkId})
//       RETURNING *
//     `;
//     console.log('Inserted row:', inserted[0]);

//     return inserted[0];
//   } catch (err) {
//     console.error('SQL error in getOrCreateUser:');
//     console.error('Message:', err.message);
//     console.error('Code:', err.code);
//     console.error('Detail:', err.detail);
//     throw err;
//   }
// }
export async function getOrCreateUser(clerkId) {
  console.log('getOrCreateUser started - clerkId:', clerkId, 'type:', typeof clerkId);

  const existing = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;
  console.log('Found existing rows:', existing.length);

  if (existing.length > 0) {
    console.log('Returning existing user:', existing[0].id);
    return existing[0];
  }

  console.log('No user found - starting INSERT');

  try {
    const inserted = await sql`
      INSERT INTO users (clerk_id, email)
      VALUES (${clerkId}, ${null})
      RETURNING id, clerk_id, email, created_at
    `;

    console.log('INSERT completed - rows affected:', inserted.length);

    if (inserted.length === 0) {
      console.log('INSERT returned zero rows - commit may have failed');
      throw new Error('Insert failed - no row returned');
    }

    console.log('New user created:', inserted[0]);
    return inserted[0];
  } catch (err) {
    console.error('Insert error:', err.message);
    throw err;
  }
}
