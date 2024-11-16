// users.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-users');

const { writeUser, getUser, getUsers, rmUserById } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Users SDK', () => {
  describe('getUser', () => {
    it('returns the given user by id from EventCatalog,', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core user',
        markdown: 'This is the core user for Eventcatalog',
      });

      const test = await getUser('eventcatalog-core-user');

      expect(test).toEqual({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core user',
        markdown: 'This is the core user for Eventcatalog',
      });
    });

    it('returns undefined when the user is not found', async () => {
      await expect(await getUser('unknown-user')).toEqual(undefined);
    });
  });

  describe('getUsers', () => {
    it('returns all the users in the catalog,', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });

      await writeUser({
        id: 'eventcatalog-second-user',
        name: 'Eventcatalog Second User',
        markdown: 'This is the second user for Eventcatalog',
      });

      const users = await getUsers();

      expect(users).toEqual([
        {
          id: 'eventcatalog-second-user',
          name: 'Eventcatalog Second User',
          markdown: 'This is the second user for Eventcatalog',
        },
        {
          id: 'eventcatalog-core-user',
          name: 'Eventcatalog Core User',
          markdown: 'This is the core user for Eventcatalog',
        },
      ]);
    });
  });

  describe('writeUser', () => {
    it('writes the given user to EventCatalog and assumes the path if one if not given', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });

      const user = await getUser('eventcatalog-core-user');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'users', 'eventcatalog-core-user.md'))).toBe(true);

      expect(user).toEqual({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });
    });

    it('throws an error when trying to write a user that already exists', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });

      await expect(
        writeUser({
          id: 'eventcatalog-core-user',
          name: 'Eventcatalog Core User',
          markdown: 'This is the core user for Eventcatalog',
        })
      ).rejects.toThrowError('Failed to write eventcatalog-core-user (user) as it already exists');
    });

    it('overrides the domain when trying to write an domain that already exists and override is true', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });

      await writeUser(
        {
          id: 'eventcatalog-core-user',
          name: 'Eventcatalog Core User Overridden',
          markdown: 'This is the core user for Eventcatalog',
        },
        { override: true }
      );

      const user = await getUser('eventcatalog-core-user');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'users', 'eventcatalog-core-user.md'))).toBe(true);
      expect(user.name).toBe('Eventcatalog Core User Overridden');
    });
  });

  describe('rmUserById', () => {
    it('removes a user from eventcatalog by id', async () => {
      await writeUser({
        id: 'eventcatalog-core-user',
        name: 'Eventcatalog Core User',
        markdown: 'This is the core user for Eventcatalog',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'users', 'eventcatalog-core-user.md'))).toBe(true);

      await rmUserById('eventcatalog-core-user');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'users', 'eventcatalog-core-user.md'))).toBe(false);
    });
  });
});
