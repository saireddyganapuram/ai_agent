import React from 'react'
import { useState , useContext , useEffect} from 'react'
import { UserContext } from '../context/userContext'
import axiosInstance from '../config/axios'
import {useNavigate} from 'react-router-dom'

const Home = () => {

  const { user } = useContext(UserContext)

  const navigate = useNavigate()

  let [isModalOpen , setIsModalOpen] = useState(false)
  let [projectName, setProjectName] = useState('')
  const [project, setProject] = useState([])

  function createProject(e) {
    e.preventDefault()
    
    axiosInstance.post('/projects/create',{
      name: projectName
    })
    .then((res) => {
      console.log(res)
      setIsModalOpen(false)
    })
    .catch((error) => {
      console.log(error)
    });

  }

  useEffect(() => {
    axiosInstance.get('/projects/all')
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
    <main className='p-4'>
      <div className='projects flex flex-wrap gap-5'> 
        <button onClick={() => setIsModalOpen(true)} className='project p-4 border border-slate-300 rounded-md font-semibold '>
          New project
          <i className="ri-add-line ml-2 font-semibold"></i>
        </button>

      {
        project.map((project) => (
          <div key={project._id} 
          onClick={() => {navigate('/project',{
            state: {project}
          })}}
          className='project p-4 border flex flex-col border-slate-300 rounded-md min-w-60 cursor-pointer'>
            <h2 className='font-semibold'>
              {project.name}
            </h2>

            <div className='flex gap-2'> 
              <p><small><i className="ri-user-line"> Collaborators :</i></small></p>
              {project.users.length}
            </div>
          </div>
        ))
      }


      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}

export default Home