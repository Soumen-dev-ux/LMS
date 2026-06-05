import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlayCircle, FaRobot } from 'react-icons/fa';
import { FaArrowLeftLong } from "react-icons/fa6";
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';

function ViewLecture() {
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course);
  const {userData} = useSelector((state) => state.user)
  const selectedCourse = courseData?.find((course) => course._id === courseId);

  const [selectedLecture, setSelectedLecture] = useState(
    selectedCourse?.lectures?.[0] || null
  );
  const navigate = useNavigate()
  const courseCreator = userData?._id === selectedCourse?.creator ? userData : null;

  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'ai-tutor'
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Tutor. Ask me any questions about this lecture or course topic!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await axios.post(
        `${serverUrl}/api/ai/ask`,
        {
          question: userMsg,
          courseTitle: selectedCourse?.title,
          lectureTitle: selectedLecture?.lectureTitle
        },
        { withCredentials: true }
      );

      setMessages(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get response from AI Tutor");
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error while trying to answer your question." }]);
    } finally {
      setChatLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6">
     
      {/* Left - Video & Course Info */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        {/* Course Details */}
        <div className="mb-6" >
           
          <h1 className="text-2xl font-bold flex items-center justify-start gap-[20px]  text-gray-800"><FaArrowLeftLong  className=' text-black w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/")}/>{selectedCourse?.title}</h1>
          
          <div className="mt-2 flex gap-4 text-sm text-gray-500 font-medium">
            <span>Category: {selectedCourse?.category}</span>
            <span>Level: {selectedCourse?.level}</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-300">
          {selectedLecture?.videoUrl ? (
            <video
              src={selectedLecture.videoUrl}
              controls
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a lecture to start watching
            </div>
          )}
        </div>

        {/* Selected Lecture Info */}
        <div className="mt-2">
          <h2 className="text-lg font-semibold text-gray-800">{selectedLecture?.lectureTitle}</h2>
          
        </div>
      </div>

      {/* Right - All Lectures / AI Tutor tabs + Creator Info */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-[600px] flex flex-col justify-between">
        <div className="flex flex-col h-[90%] overflow-y-auto">
          {/* Tabs header */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex-1 text-center py-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`flex-grow flex items-center justify-center gap-2 py-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'ai-tutor'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaRobot /> AI Tutor
            </button>
          </div>

          {activeTab === 'curriculum' ? (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">All Lectures</h2>
              <div className="flex flex-col gap-3 mb-6">
                {selectedCourse?.lectures?.length > 0 ? (
                  selectedCourse.lectures.map((lecture, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition text-left ${
                        selectedLecture?._id === lecture._id
                          ? 'bg-gray-200 border-gray-500'
                          : 'hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">{lecture.lectureTitle}</h4>
                      </div>
                      <FaPlayCircle className="text-black text-xl" />
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No lectures available.</p>
                )}
              </div>

              {/* Creator Info */}
              {courseCreator && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Instructor</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={courseCreator.photoUrl || '/default-avatar.png'}
                      alt="Instructor"
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="text-base font-medium text-gray-800">{courseCreator.name}</h4>
                      <p className="text-sm text-gray-600">
                        {courseCreator.description || 'No bio available.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 mb-4 max-h-[350px]">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-black text-white ml-auto rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 mr-auto rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {chatLoading && (
                  <div className="bg-gray-100 text-gray-500 mr-auto rounded-2xl rounded-tl-none px-4 py-2 text-sm border border-gray-200 flex items-center gap-2">
                    <span className="animate-pulse">AI Tutor is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-3">
                <input
                  type="text"
                  placeholder="Ask a question about this lecture..."
                  className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black text-black"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-black hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition cursor-pointer"
                >
                  Ask
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewLecture;
