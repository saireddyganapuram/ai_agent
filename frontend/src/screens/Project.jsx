import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import {initializeSocket, recieveMessage, sendMessage} from '../config/socket'
import { UserContext } from "../context/userContext";
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import { getWebContainer} from "../config/webContainer";



    function SyntaxHighlightedCode(props) {
      const ref = useRef (null)

      React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
        window.hljs.highlightElement(ref.current)
        // hljs won't reprocess the element unless this attribute is removed
        ref.current.removeAttribute('data-highlighted')
        }
      },  [props.className, props.children])
      return <code {...props} ref={ref} />
    }
  

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([])
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const { user } = useContext(UserContext)
  const messageBoxRef = useRef(null);
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iFrameUrl, setIFrameUrl] = useState(null)

  const [fileTree , setFileTree] = useState({})

  const handleUserSelect = (id) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((userId) => userId !== id)
        : [...prevSelected, id]
    );
  };

  const addCollaborator = () => {
    axiosInstance.put('/projects/add',{
      projectId: location.state.project._id,
      users: selectedUserIds
    }).then((res) => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function send() {
    if (!user) {
      console.error("User is not defined. Ensure UserContext is properly set.");
      return;
    }
    
    // Create outgoing message object
    const outgoingMessage = {
      message,
      sender: user,
      isOutgoing: true
    };
    
    // Send message to server
    sendMessage('project-message', {
      message,
      sender: user
    });

    // Add message to local state immediately for sender
    setMessages(prev => [...prev, outgoingMessage]);
    

    // Clear the input
    setMessage("");
  }

  function WriteAiMessage(message) {

  const messageObj = JSON.parse(message)

    return (
      
        <div className="overflow-auto bg-slate-900 text-white rounded-sm p-1">
          <Markdown
            children={messageObj.text}
            options={{
              overrides: {
                code: {
                  component: SyntaxHighlightedCode, 
                },
              },
            }}
          >{messageObj.text}</Markdown>
        </div>
      
    )
  }

  useEffect(() => {
    initializeSocket(project._id)

    if(!webContainer) {
      getWebContainer().then((container) => { 
        setWebContainer(container);
        console.log("container created");
      }
      )
    }

    recieveMessage('project-message', data => { 
      console.log(data);

      // Only process fileTree if it exists in the message
      if (data.message && typeof data.message === 'string' && data.message.includes('fileTree')) {
        try {
          const messageObj = JSON.parse(data.message);
          if (messageObj.fileTree) {
            webContainer?.mount(messageObj.fileTree);
            setFileTree(messageObj.fileTree);
          }
        } catch (error) {
          console.error('Error parsing message with fileTree:', error);
        }
      }
      
      // Only add message to state if it's from another user
      if (data.sender._id !== user._id) {
        try {
          setMessages(prev => [...prev, { ...data, isOutgoing: false }]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    });
    

    axiosInstance.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project)
    }).catch((error) => {
      console.log(error)
    })

    axiosInstance.get("/users/all").then((res) => {
      setUsers(res.data.users)
    }).catch((error) => {
      console.log(error)
    })
  }, [])

  return (
    <main className="h-screen w-screen flex">
      <section className="left flex flex-col h-screen w-[370px] bg-slate-200 relative">
        <header className="flex justify-between p-2 px-4 w-[370px] bg-slate-100 absolute top-0 z-10" >
          <button
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-line"></i>
            <p>Add Collaborator</p>
          </button>

          <button
            onClick={() => {
              setIsSidePanelOpen(!isSidePanelOpen);
            }}
            className="p-2"
          >
            <i className="ri-group-line"></i>
          </button>
        </header>

        <div className="conversation-area flex flex-col h-full relative">
          <div 
            ref={messageBoxRef}
            className="message-box flex flex-col p-1 gap-1 overflow-y-auto h-full pt-16 pb-11 scrollbar-hide smooth-scroll"
          >
            {messages.map((messageObj, index) => (
              <div 
                key={index} 
                className={`message flex flex-col rounded-md w-fit p-2 ${messageObj.sender.email === '@ai'?'max-w-80':'max-w-60'} ${
                  messageObj.isOutgoing 
                    ? "ml-auto bg-slate-50 text-black"  
                    : "bg-slate-100"
                }`}
              >
                <small className={`text-sm ${messageObj.isOutgoing ? "text-black" : "opacity-65"}`}>
                  {messageObj.sender.email}
                </small>
                <p className="text-sm font-semibold">
                  {messageObj.sender.email === '@ai' ? 
                  WriteAiMessage(messageObj.message)
                  : (
                    messageObj.message
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="inputField justify-between w-full flex absolute bottom-0 bg-slate-300">
            <input 
              value={message}
              onChange={(e) => {setMessage(e.target.value)}}
              className="border-none outline-none p-2 px-4 w-[310px]"
              type="text"
              placeholder="Enter message"
            />
            <button 
            onClick={send}
            className="flex-grow justify-center items-center w-[60] bg-slate-950">
              <i className="ri-send-plane-fill text-2xl text-white"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel flex flex-col w-[370px] h-full bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="w-full flex justify-between items-center p-2 px-3 bg-slate-200">

            <h1 className="text-lg font-bold">Collaborators</h1>

            <button
              onClick={() => {
                setIsSidePanelOpen(!isSidePanelOpen);
              }}
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2 p-1">
            {project.users && project.users.map((user,index) => {
              return (
                <div className="user flex items-center gap-3 p-2 hover:bg-slate-300 cursor-pointer rounded-md">
              <div className="aspect-square h-fit w-fit flex items-center rounded-full justify-center p-5 bg-slate-600">
                <i className="ri-user-3-fill absolute"></i>
              </div>

              <h1 className="font-semibold">{user.email}</h1>
             </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="right flex-grow h-full bg-slate-100 flex flex-row">
        <div className="explorer h-full max-w-96 min-w-56 bg-slate-300">
          <div className="file-tree w-full h-full flex flex-col">
          {Object.keys(fileTree).map((fileName, index) => (
              <button
                onClick={() => {
                    setCurrentFile(fileName)
                    setOpenFiles((prev) => Array.from(new Set([...prev, fileName])));
                    }}
                     key={index} className="tree-element border border-b-gray-400 w-full p-2 cursor-pointer flex justify-center items-center gap-2 bg-slate-400">
                    <p className="font-semibold text-lg">{fileName}</p>
                    </button>
                  ))}

                  </div>
                  </div>
                  
                  
                  <div className="code-editor h-full flex flex-col flex-grow ">
                    <div className="top flex items-center h-9 bg-slate-300 justify-between">
                    <div className="flex">
                      {openFiles &&
                      openFiles.map((file, index) => (
                        <>
                        <div className="flex justify-start">
                        <button
                        key={index}
                        className={`p-2 text-lg font-semibold ${
                          file === currentFile ? "bg-slate-400" : ""
                        }`}
                        onClick={() => 
                          setCurrentFile(file)
                        }>
                        {file}
                        </button>
                        <button
                        onClick={() => {
                          setOpenFiles((prev) => prev.filter((f) => f !== file));
                          if (currentFile === file) {
                          const remainingFiles = openFiles.filter((f) => f !== file);
                          setCurrentFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
                          }
                        }}
                        className={` h-full ${
                          file === currentFile ? "bg-slate-400" : ""
                        }`}>
                        <i className={`ri-close-fill text-lg pr-1`}></i>
                        </button>
                        </div> 
                      </>
                      ))
                      }
                    </div>
                    {Object.keys(fileTree).length > 0 && (
                      <div>
                      <button 
                      onClick={async () => {
                        try {
                          // Mount the file system (assuming fileTree includes package.json and app.js)
                          await webContainer?.mount(fileTree);
                          
                          // Install dependencies
                          const installProcess = await webContainer?.spawn("npm", ["install"]);
                          
                          // Set up output handling
                          installProcess.output.pipeTo(
                            new WritableStream({
                              write: (chunk) => {
                                console.log(chunk);
                              },
                            })
                          );
                          
                          // Wait for install to complete
                          const installExitCode = await installProcess.exit;
                          
                          if (installExitCode !== 0) {
                            console.error(`Installation failed with exit code ${installExitCode}`);
                            return;
                          }
                          
                          // Run npm start
                          const runProcess = await webContainer?.spawn("npm", ["start"]);
                          runProcess.output.pipeTo(
                            new WritableStream({
                              write: (chunk) => {
                                console.log(chunk);
                              },
                            })
                          );
                        } catch (error) {
                          console.error("Error in WebContainer operations:", error);
                        }

                        webContainer.on('server-ready',(port,url) => {
                          console.log(port,url)
                          setIFrameUrl(url)
                        })
                      }}
                      className="bg-slate-950 text-white p-1  px-5  h-9 rounded-sm  ">Run</button>
                      </div>
                    )}
                    </div>
                    <div className="bottom flex flex-grow">
                    {fileTree[currentFile] && (
                      <div className="code-editor-area h-full overflow-auto flex-grow bg-gray-900 text-white opacity-80 px-3 py-2">
                      <pre className="hlsjs h-full">
                        <code
                        className="hlsjs outline-none h-full"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updatedContent = e.target.innerText;
                          setFileTree((prev) => ({
                          ...prev,
                          [currentFile]: {
                            ...prev[currentFile],
                            content: updatedContent,
                          },
                          }));
                        }}
                        dangerouslySetInnerHTML={{
                          __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value,
                        }}
                        style={{
                          whiteSpace: 'pre-wrap',
                          paddingBottom: '25rem',
                          counterSet: 'line-numbering',
                        }}
                        />
                      </pre>
                      </div>
                    )}
                    </div>
                  </div>

                  {iFrameUrl && webContainer &&
                    <div className="flex flex-col w-1/2">
                      <div className="header w-full h-12">
                      <input 
                          value={iFrameUrl} 
                          onChange={(e) => setIFrameUrl(e.target.value)}
                          className="w-full p-2 bg-slate-700 text-white"
                        />
                      </div>
                      <div><iframe src={iFrameUrl} className="w-full h-full"></iframe></div>
                    </div>
                  }
                              
              
              </section>
              {/* Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            {/* Close Icon */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <h2 className="text-xl font-bold mb-4">Select Users</h2>

            {/* Scrollable User List */}
            <div className="max-h-[300px] overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-3 flex items-center gap-3 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedUserIds.includes(user._id)
                      ? "bg-slate-300 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  {/* User Icon */}
                  <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                    <i className="ri-user-3-fill text-white"></i>
                  </div>
                  <span>{user.email}</span>
                </div>
              ))}
            </div>

            {/* Fixed Add Collaborator Button */}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600"
                onClick={() => {
                  addCollaborator()
                  setIsModalOpen(false);
                }}
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default Project;