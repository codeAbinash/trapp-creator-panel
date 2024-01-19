import React from 'react'
import { useRouteError } from 'react-router-dom'

function ErrorUI() {
  let error = useRouteError()
  console.log(error)
  return <div>ErrorUI</div>
}

export default ErrorUI
