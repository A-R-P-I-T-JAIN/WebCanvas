import { SignIn } from '@clerk/clerk-react'
import React from 'react'

const SignInOut = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center bg-slate-900' >
      <SignIn />
    </div>
  )
}

export default SignInOut
