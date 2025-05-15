
// Execute this with Node.js to apply the reviews foreign keys migration
const { execSync } = require('child_process');

console.log('Applying reviews foreign key constraints migration...');

try {
  // Execute a command to apply the migration via your database client
  // This is just a placeholder - you would use the actual connection details
  // from your environment variables or configuration
  const command = `psql ${process.env.SUPABASE_DB_URL} -f ./src/services/migrations/add_reviews_foreign_keys.sql`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Failed to apply migration:', error);
  process.exit(1);
}
