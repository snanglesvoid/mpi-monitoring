var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Administrator', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.relationship({ ref: 'Project', path: 'readPermissions', refPath: 'readPermission' })
User.relationship({ ref: 'Project', path: 'writePermissions', refPath: 'writePermission' })

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
