import React,{useContext} from 'react'
import { userContext } from '../App';
const Home = () => {
  const {state,dispatch}=useContext(userContext);
  return (
    <div className='home'>
      
      <h1 >Welcome</h1>
    </div>
  )
}

export default Home