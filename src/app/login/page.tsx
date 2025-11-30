import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login Inventaris</h1>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            name="email" 
            type="email" 
            required 
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Form ini akan memanggil Server Action 'login' */}
        <button 
          formAction={login} 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Masuk
        </button>
      </form>
    </div>
  )
}