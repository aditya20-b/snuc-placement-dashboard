import { createUser } from '../lib/auth'

async function main() {
  const username = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4]

  if (!username || !password) {
    console.error('Usage: pnpm create-admin <username> <password> [name]')
    process.exit(1)
  }

  try {
    const user = await createUser(username, password, name)
    console.log('✅ Admin user created successfully!')
    console.log('Username:', user.username)
    console.log('Name:', user.name || 'Not provided')
    console.log('\nYou can now sign in at /sign-in')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.error('❌ Error: Username already exists')
    } else {
      console.error('❌ Error creating admin user:', error)
    }
    process.exit(1)
  }
}

main()