import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { initializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { UserContext } from "../context/userContext";
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import { getWebContainer } from "../config/webContainer";
import ErrorBoundary from "../components/ErrorBoundary";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current);
      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted');
    }
  }, [props.className, props.children]);
  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBoxRef = useRef(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const webContainerRef = useRef(null);
  const [iFrameUrl, setIFrameUrl] = useState(null);
  const [fileTree, setFileTree] = useState({});

  // New UX/Responsive states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'code' | 'preview'

  const handleUserSelect = (id) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((userId) => userId !== id)
        : [...prevSelected, id]
    );
  };

  const addCollaborator = () => {
    axiosInstance.put('/projects/add', {
      projectId: location.state.project._id,
      users: selectedUserIds
    }).then((res) => {
      console.log(res);
    }).catch((error) => {
      console.log(error);
    });
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);

  // Adjust explorer default visibility on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExplorerOpen(false);
      } else {
        setIsExplorerOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // run initially
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function send() {
    if (!user) {
      console.error("User is not defined. Ensure UserContext is properly set.");
      return;
    }
    
    if (!message.trim()) return;

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
    
    // If targeted at AI, set loading state to true
    if (message.includes('@ai')) {
      setIsAiLoading(true);
    }

    // Clear the input
    setMessage("");
  }

  function WriteAiMessage(messageStr) {
    try {
      const messageObj = JSON.parse(messageStr);
      return (
        <div className="markdown-body bg-white rounded-sm">
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
      );
    } catch (error) {
      console.error("Failed to parse AI message JSON:", error);
      return (
        <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-semibold text-xs flex items-center gap-2">
          <i className="ri-error-warning-line text-base text-red-500"></i>
          <span>Error while generating the code.</span>
        </div>
      );
    }
  }

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => { 
        setWebContainer(container);
        webContainerRef.current = container;
        console.log("container created");
      });
    }

    recieveMessage('project-message', data => { 
      console.log(data);

      // Only process fileTree if it exists in the message
      if (data.message && typeof data.message === 'string' && data.message.includes('fileTree')) {
        try {
          const messageObj = JSON.parse(data.message);
          if (messageObj.fileTree) {
            webContainerRef.current?.mount(messageObj.fileTree);
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
          // If the message contains @ai, set AI loading to true
          if (data.message && typeof data.message === 'string' && data.message.includes('@ai')) {
            setIsAiLoading(true);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }

      // If the incoming message is from AI, reset loading state
      if (data.sender.email === '@ai') {
        setIsAiLoading(false);
      }
    });

    axiosInstance.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project);
    }).catch((error) => {
      console.log(error);
    });

    axiosInstance.get("/users/all").then((res) => {
      setUsers(res.data.users);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-slate-100 font-sans">
      
      {/* Mobile Top Navigation Tab Bar */}
      <div className="flex md:hidden bg-slate-900 text-white h-14 justify-around items-center border-b border-slate-800 shrink-0 select-none">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="ri-chat-3-line text-lg mb-0.5"></i>
          <span className="text-[10px] font-semibold tracking-wide">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab("code")}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'code' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="ri-code-box-line text-lg mb-0.5"></i>
          <span className="text-[10px] font-semibold tracking-wide">Code</span>
        </button>
        {iFrameUrl && (
          <button 
            onClick={() => setActiveTab("preview")}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'preview' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <i className="ri-chrome-line text-lg mb-0.5"></i>
            <span className="text-[10px] font-semibold tracking-wide">Preview</span>
          </button>
        )}
      </div>

      {/* Left Chat & Collaborators Panel */}
      <section className={`left flex flex-col h-full md:h-screen w-full md:w-[370px] bg-slate-200 relative overflow-hidden shrink-0 border-r border-slate-300 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
        <header className="flex justify-between items-center p-3 px-4 bg-slate-100 border-b border-slate-300 shrink-0 h-14" >
          <button
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-semibold text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-line text-lg text-blue-600"></i>
            <p>Add Collaborator</p>
          </button>

          <button
            onClick={() => {
              setIsSidePanelOpen(!isSidePanelOpen);
            }}
            className="p-2 text-slate-700 hover:text-slate-950 transition-colors rounded-full hover:bg-slate-250 flex items-center justify-center"
          >
            <i className="ri-group-line text-lg"></i>
          </button>
        </header>

        <div className="conversation-area flex flex-col flex-grow overflow-hidden relative bg-slate-50">
          <ErrorBoundary>
            <div 
              ref={messageBoxRef}
              className="message-box flex flex-col p-4 gap-4 overflow-y-auto flex-grow scrollbar-hide smooth-scroll"
            >
              {messages.map((messageObj, index) => (
                <div 
                  key={index} 
                  className={`message flex flex-col rounded-lg w-fit p-3 shadow-sm border ${
                    messageObj.sender.email === '@ai' 
                      ? 'max-w-[85%] md:max-w-[80%] bg-white border-slate-200 text-slate-800 mr-auto' 
                      : messageObj.isOutgoing
                        ? 'max-w-[75%] ml-auto bg-slate-100 text-slate-950 border-slate-300'
                        : 'max-w-[75%] mr-auto bg-slate-200 text-slate-800 border-slate-250'
                  }`}
                >
                  <small className={`text-[10px] font-bold mb-1 opacity-70 ${messageObj.isOutgoing ? 'text-slate-600' : 'text-slate-500'}`}>
                    {messageObj.sender.email}
                  </small>
                  <div className="text-sm font-normal">
                    {messageObj.sender.email === '@ai' ? 
                    WriteAiMessage(messageObj.message)
                    : (
                      messageObj.message
                    )}
                  </div>
                </div>
              ))}
              
              {isAiLoading && (
                <div className="message flex flex-col rounded-lg w-fit p-3.5 max-w-[85%] md:max-w-[80%] bg-white border border-slate-200 shadow-sm mr-auto animate-pulse">
                  <small className="text-xs text-blue-600 font-bold flex items-center gap-1.5 mb-2.5">
                    <i className="ri-robot-line text-lg animate-bounce text-blue-500"></i>
                    <span>@ai</span>
                    <span className="text-[10px] opacity-75 font-normal animate-pulse text-blue-400">(Generating response...)</span>
                  </small>
                  <div className="flex flex-col gap-2.5 w-60 md:w-72">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              )}
            </div>
          </ErrorBoundary>

          <div className="inputField flex items-center justify-between w-full bg-slate-200 border-t border-slate-300 shrink-0 h-14">
            <input 
              value={message}
              onChange={(e) => {setMessage(e.target.value)}}
              className="border-none outline-none p-3 px-4 flex-grow bg-white text-slate-800 text-sm h-full"
              type="text"
              placeholder="Enter message"
              onKeyDown={(e) => { if(e.key === 'Enter') send(); }}
            />
            <button 
              onClick={send}
              className="flex justify-center items-center w-14 h-full bg-slate-950 text-white hover:bg-slate-900 transition-colors shrink-0">
              <i className="ri-send-plane-fill text-xl"></i>
            </button>
          </div>
        </div>

        {/* Side Panel for Collaborators */}
        <div
          className={`sidePanel flex flex-col w-full md:w-[370px] h-full bg-slate-50 absolute transition-all z-20 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="w-full flex justify-between items-center p-3 px-4 bg-slate-200 border-b border-slate-300 h-14 shrink-0">
            <h1 className="text-base font-bold text-slate-800">Collaborators</h1>
            <button
              onClick={() => {
                setIsSidePanelOpen(!isSidePanelOpen);
              }}
              className="p-1 hover:bg-slate-300 rounded-full transition-colors flex items-center justify-center"
            >
              <i className="ri-close-line text-2xl text-slate-600"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2 p-3 overflow-y-auto flex-grow bg-slate-50">
            {project.users && project.users.map((user, index) => {
              return (
                <div key={index} className="user flex items-center gap-3 p-2 hover:bg-slate-200 cursor-pointer rounded-md transition-colors border border-slate-100">
                  <div className="aspect-square h-8 w-8 flex items-center rounded-full justify-center bg-slate-600 text-white">
                    <i className="ri-user-3-fill text-sm"></i>
                  </div>
                  <h1 className="font-semibold text-sm text-slate-700 truncate">{user.email}</h1>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Explorer, Editor & Preview Panel */}
      <section className={`right flex-grow h-full bg-slate-100 flex flex-col md:flex-row overflow-hidden ${activeTab !== 'chat' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Code View (Explorer and Editor) wrapper */}
        <div className={`flex-row flex-grow h-full overflow-hidden ${activeTab === 'code' ? 'flex' : 'hidden md:flex'}`}>
          {/* File Explorer */}
          {isExplorerOpen && (
            <ErrorBoundary>
              <div className="explorer h-full w-60 bg-slate-300 flex flex-col shrink-0 border-r border-slate-400 overflow-y-auto">
                <div className="p-3 bg-slate-200 border-b border-slate-400 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Files
                </div>
                <div className="file-tree w-full flex flex-col">
                  {Object.keys(fileTree).map((fileName, index) => (
                    <button
                      onClick={() => {
                        setCurrentFile(fileName);
                        setOpenFiles((prev) => Array.from(new Set([...prev, fileName])));
                      }}
                      key={index} 
                      className={`tree-element border-b border-slate-400 w-full p-2.5 cursor-pointer flex justify-start items-center gap-2 transition-colors ${fileName === currentFile ? 'bg-slate-450 text-slate-900 border-l-4 border-l-slate-800' : 'bg-slate-300 text-slate-700 hover:bg-slate-350'}`}
                    >
                      <i className="ri-file-code-line text-lg"></i>
                      <p className="font-semibold text-sm truncate">{fileName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </ErrorBoundary>
          )}
                    
          {/* Code Editor */}
          <div className="code-editor h-full flex flex-col flex-grow overflow-hidden">
            <div className="top flex items-center h-10 bg-slate-300 justify-between px-2 shrink-0 border-b border-slate-400 select-none">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {/* Explorer toggle button inside editor bar */}
                <button
                  onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                  className="p-1.5 hover:bg-slate-400 rounded transition-colors text-slate-700 hover:text-slate-900 mr-2 flex items-center justify-center"
                  title="Toggle Explorer"
                >
                  <i className={`ri-side-bar-${isExplorerOpen ? 'fill' : 'line'} text-lg`}></i>
                </button>

                {openFiles &&
                  openFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-start shrink-0 mr-1.5 rounded-t overflow-hidden">
                      <button
                        className={`p-2 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          file === currentFile ? "bg-slate-450 text-slate-950 font-bold" : "bg-slate-250 text-slate-600 hover:bg-slate-350"
                        }`}
                        onClick={() => setCurrentFile(file)}
                      >
                        <i className="ri-file-code-line text-sm"></i>
                        <span>{file}</span>
                      </button>
                      <button
                        onClick={() => {
                          setOpenFiles((prev) => prev.filter((f) => f !== file));
                          if (currentFile === file) {
                            const remainingFiles = openFiles.filter((f) => f !== file);
                            setCurrentFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
                          }
                        }}
                        className={`p-2 transition-colors flex items-center justify-center ${
                          file === currentFile ? "bg-slate-450 text-slate-950 hover:bg-red-200 hover:text-red-800" : "bg-slate-250 text-slate-600 hover:bg-slate-350"
                        }`}
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  ))
                }
              </div>
              
              {Object.keys(fileTree).length > 0 && (
                <div>
                  <button 
                    disabled={isRunning}
                    onClick={async () => {
                      setIsRunning(true);
                      setIFrameUrl(null);
                      setActiveTab("preview"); // Switch to preview tab on mobile so they see it running
                      
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
                          setIsRunning(false);
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
                        setIsRunning(false);
                      }

                      webContainer?.on('server-ready', (port, url) => {
                        console.log(port, url);
                        setIFrameUrl(url);
                        setIsRunning(false);
                      });
                    }}
                    className={`bg-slate-950 text-white px-4 h-7 text-xs font-semibold rounded flex items-center gap-1.5 ${isRunning ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-900 transition-colors'}`}
                  >
                    {isRunning ? (
                      <>
                        <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-play-fill text-sm"></i>
                        <span>Run</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <ErrorBoundary>
              <div className="bottom flex-grow overflow-hidden bg-gray-900 relative">
                {fileTree[currentFile] ? (
                  <div className="code-editor-area h-full overflow-auto bg-gray-950 text-slate-100 opacity-90 p-4 font-mono leading-relaxed">
                    <pre className="hlsjs h-full m-0">
                      <code
                        className="hlsjs outline-none h-full"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updatedContent = e.target.innerText;
                          
                          webContainer?.fs.writeFile(currentFile, updatedContent).catch((err) => {
                            console.error("Failed to write file to WebContainer:", err);
                          });

                          setFileTree((prev) => ({
                            ...prev,
                            [currentFile]: {
                              ...prev[currentFile],
                              file: {
                                ...prev[currentFile]?.file,
                                contents: updatedContent,
                              }
                            },
                          }));
                        }}
                        dangerouslySetInnerHTML={{
                          __html: hljs.highlight(
                            fileTree[currentFile]?.file?.contents || fileTree[currentFile]?.contents || "",
                            { language: 'javascript' }
                          ).value,
                        }}
                        style={{
                          whiteSpace: 'pre-wrap',
                          paddingBottom: '15rem',
                          display: 'block',
                        }}
                      />
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 font-medium select-none">
                    <i className="ri-code-box-line text-4xl mb-2 opacity-50"></i>
                    <p className="text-sm">Select a file from the explorer to edit</p>
                  </div>
                )}
              </div>
            </ErrorBoundary>
          </div>
        </div>

        {/* WebContainer Server Preview Frame (with Terminal Shimmer Loader) */}
        {(isRunning || (iFrameUrl && webContainer)) && (
          <div className={`flex flex-col w-full md:w-1/2 h-full bg-white border-t md:border-t-0 md:border-l border-slate-300 overflow-hidden ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
            {isRunning && !iFrameUrl ? (
              <div className="flex flex-col items-center justify-center flex-grow p-6 bg-slate-900 text-slate-100 font-mono select-none overflow-hidden h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3.5 h-3.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Running Application...</h3>
                <p className="text-xs text-slate-400 mb-6 text-center max-w-xs leading-relaxed">Please wait while the environment is loaded, dependencies are installed, and the server initiates.</p>
                
                {/* Skeleton Terminal Shimmer */}
                <div className="w-full max-w-sm bg-slate-950 rounded-lg p-4 border border-slate-800 shadow-2xl flex flex-col gap-3">
                  <div className="flex gap-1.5 mb-1 border-b border-slate-800 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-5/6"></div>
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-2/3"></div>
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ) : (
              <ErrorBoundary>
                <div className="flex flex-col h-full w-full">
                  <div className="header w-full h-11 flex items-center bg-slate-800 px-3 shrink-0 border-b border-slate-950">
                    <div className="flex gap-1.5 items-center mr-3 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                    </div>
                    <input 
                      value={iFrameUrl} 
                      onChange={(e) => setIFrameUrl(e.target.value)}
                      className="w-full p-1 px-3 bg-slate-700 text-white rounded text-xs outline-none border border-slate-650 hover:bg-slate-650 focus:bg-slate-600 transition-colors truncate"
                    />
                  </div>
                  <div className="flex-grow w-full bg-white relative">
                    <iframe src={iFrameUrl} className="w-full h-full border-none bg-white"></iframe>
                  </div>
                </div>
              </ErrorBoundary>
            )}
          </div>
        )}
      </section>

      {/* Collaborator Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              onClick={() => setIsModalOpen(false)}
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <h2 className="text-lg font-bold mb-4 text-slate-800">Select Collaborators</h2>

            <div className="max-h-[260px] overflow-y-auto pr-1 flex flex-col gap-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2.5 flex items-center gap-3 rounded-md cursor-pointer transition-all border ${
                    selectedUserIds.includes(user._id)
                      ? "bg-slate-200 border-slate-300 text-slate-800"
                      : "bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700"
                  }`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    <i className="ri-user-3-fill text-sm"></i>
                  </div>
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-5 pt-3 border-t border-slate-100">
              <button
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-semibold transition-colors shadow-sm"
                onClick={() => {
                  addCollaborator();
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