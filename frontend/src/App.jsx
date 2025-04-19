import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/userContext'

const App = () => {
  return (
    <>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </>
  )
}

export default App