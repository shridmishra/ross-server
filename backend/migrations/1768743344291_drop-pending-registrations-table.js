/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * This migration removes the pending_registrations table that was introduced
 * for the two-step email verification flow. The flow has been reverted to
 * create users directly in the users table with email_verified = false.
 */

exports.up = pgm => {
  // Drop indexes first
  pgm.dropIndex('pending_registrations', 'email', {
    name: 'idx_pending_registrations_email',
    ifExists: true
  });
  pgm.dropIndex('pending_registrations', 'expires_at', {
    name: 'idx_pending_registrations_expires_at',
    ifExists: true
  });

  // Drop the pending_registrations table
  pgm.dropTable('pending_registrations', { ifExists: true });
};

exports.down = pgm => {
  // Recreate the pending_registrations table
  pgm.createTable('pending_registrations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    organization: {
      type: 'varchar(255)'
    },
    otp: {
      type: 'varchar(10)',
      notNull: true
    },
    expires_at: {
      type: 'timestamp',
      notNull: true
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP')
    }
  }, { ifNotExists: true });

  // Recreate indexes
  pgm.createIndex('pending_registrations', 'email', {
    name: 'idx_pending_registrations_email',
    ifNotExists: true
  });
  pgm.createIndex('pending_registrations', 'expires_at', {
    name: 'idx_pending_registrations_expires_at',
    ifNotExists: true
  });
};
