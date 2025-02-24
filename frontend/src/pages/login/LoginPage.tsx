import LoginForm from './components/LoginForm'

const LoginPage = () => {

  const handleLogin = (username: string, password: string) => {
    // TODO: Replace with actual API call
    console.log('Login attempt:', { username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-900 p-4">
      <div className="max-w-md w-full space-y-8 bg-secondary-800 p-8 rounded-lg">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  )
}

export default LoginPage
