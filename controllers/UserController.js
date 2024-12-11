import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import dbClient from '../utils/db.js';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is missing
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const db = dbClient.client.db(dbClient.dbName);
      const usersCollection = db.collection('users');

      // Check if email already exists
      const userExists = await usersCollection.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = createHash('sha1').update(password).digest('hex');

      // Insert the new user
      const newUser = {
        email,
        password: hashedPassword,
      };
      const result = await usersCollection.insertOne(newUser);

      // Respond with the new user's id and email
      return res.status(201).json({ id: result.insertedId, email });
    } catch (err) {
      console.error(`Error creating user: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
