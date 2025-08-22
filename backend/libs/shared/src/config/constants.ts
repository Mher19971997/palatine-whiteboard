export namespace constants {
  export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
  export const PASSWORD_REGEXP = `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?@#$%^&*()-_+=,./])(?=.{8,})`;
  export const STATUS_ENABLED = 'enabled';
  export const STATUS_DISABLED = 'disabled';
  export const STATUS_DELETED = 'deleted';
  export const STATUS_BLOCKED = 'blocked';
}
