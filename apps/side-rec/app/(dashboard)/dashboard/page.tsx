"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaPlay, FaPlus, FaUsers } from "react-icons/fa6";
import { Users } from 'lucide-react';
import { GrFormSchedule, GrSchedule } from "react-icons/gr";
import { PiVideoConference } from "react-icons/pi";
import { CiTimer } from "react-icons/ci";
import { GrStorage } from "react-icons/gr";
import { FiDownload } from "react-icons/fi";
import { IoShareSocialSharp } from "react-icons/io5";
import { IoIosSearch, IoMdTime } from "react-icons/io";

const DashboardPage = () => {
  type Meeting = {
    id: number,
    title: string,
    createdAt: string,
    meetingId: string,
    durationMs: number,
    uploaded?: boolean,
    status: "Uploaded" | "Processing" | "Available"
  }
  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [search, setSearch] = useState("");
  const [joinId, setJoinId] = useState("");
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    description: ""
  })
  const { data: session, status } = useSession();
  console.log("session: ", session);
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [user, setUser] = useState({
    userId: "",
    fullname: "",
    email : "",
    profilePic: ""
  })
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false)

  useEffect(() => {
    console.log("Session data:", session);
    if (session?.user) {
      console.log("Setting user data:", session.user);
      setUser({
        userId: session.user.id ?? "",
        fullname: session.user.name ?? "",
        email: session.user.email ?? "",
        profilePic: session.user.image ?? "",
      });
    }
  }, [session, setUser]);


  const filteredMeetings = (meetings || []).filter((meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase())
  );
console.log("userId before useEffect: ", user.userId)
  const generateMeetingId = () => Math.random().toString(36).substring(2, 10);

  const handleCreateMeeting = async () => {
    if (!user.userId) {
      console.error("No user ID available");
      return;
    }
    if (!meetingDetails.title.trim()) {
      alert("Please enter a meeting title.");
      return;
    }
    try {
      setLoadingCreate(true);
      const meetingId = generateMeetingId();
      const res = await fetch("http://localhost:4000/api/meeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: user.userId, title: meetingDetails.title, description:meetingDetails.description, meetingId }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("data: ", data);
      if (data.meeting?.meetingId) {
        window.location.href = `/meeting/${data.meeting.meetingId}`;
      } else {
        console.error("No meeting ID in response:", data);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally { setLoadingCreate(false)}
  };
  useEffect(() => {
    console.log("fetching meeting history...");
    const fetchMeetings = async () => {
      if (!user.userId) {
        console.warn("No userId found. Skipping fetch.");
        return;
      }
      try {
        const res = await fetch(`http://localhost:4000/api/meeting/history/${user.userId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        console.log("Fetched meetings:", data);
        setMeetings(data.meetings || []); 
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMeetings();
  }, [user?.userId, setMeetings]);

  if (status === "loading") {
    return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-6 max-w-4xl mx-auto">Please log in to access the dashboard.</div>;
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-opacity-100">
          <div className="bg-[#0A0A0A] border-[1px] border-[#232323] text-white rounded-xl  shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-xl mb-1 font-medium">Create New Meeting</h2>
            <p className="text-sm max-w-sm text-[#A1A1A1] mb-4">Write title and description for your meeting. Click create when you're done.</p>
            <label className="block mb-2 text-sm"> Title</label>
            <input
              type="text"
              value={meetingDetails.title}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, title: e.target.value })}
              className="w-full bg-[#151515] focus:outline-offset-2 focus:outline-[#3F3F3F] focus:outline-[1px] text-white placeholder:text-white placeholder:text-sm border-[1px] mb-4 px-3 py-2 border-[#383838] rounded-lg"
              placeholder="Enter title"
            />
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              value={meetingDetails.description}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, description: e.target.value })}
              className="w-full bg-[#151515] focus:outline-offset-2 focus:outline-[#3F3F3F] focus:outline-[1px] text-white placeholder:text-white placeholder:text-sm border-[1px] mb-4 px-3 py-2 border-[#383838] rounded-lg"
              placeholder="Enter description"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-[#151515] transition-all duration-100 hover:bg-[#383838] border-[1px] border-[#383838] rounded-lg "
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCreateMeeting();
                  setOpen(false);
                }} disabled={loadingCreate}
                className="px-4 py-2 bg-gray-300 rounded-lg text-black hover:bg-gray-400"
              >
                {loadingCreate ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
      {open1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-opacity-100">
          <div className="bg-[#0A0A0A] border-[1px] border-[#232323] text-white rounded-xl  shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-xl mb-1 font-medium">Join Meeting</h2>
            <p className="text-sm max-w-sm text-[#A1A1A1] mb-4">Write the unique Meeting Id of the meeting you want to join. Click join when you're done.</p>
            <label className="block mb-2 text-sm"> Meeting ID</label>
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId( e.target.value )}
              className="w-full bg-[#151515] focus:outline-offset-2 focus:outline-[#3F3F3F] focus:outline-[1px] text-white placeholder:text-white placeholder:text-sm border-[1px] mb-4 px-3 py-2 border-[#383838] rounded-lg"
              placeholder="Enter meeting id"
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen1(false)}
                className="px-4 py-2 bg-[#151515] transition-all duration-100 hover:bg-[#383838] border-[1px] border-[#383838] rounded-lg "
              >
                Cancel
              </button>
              <button
                onClick={() => {
                if (joinId) window.location.href = `/meeting/${joinId}`;
                }} disabled={loadingCreate}
                className="px-4 py-2 bg-gray-300 rounded-lg text-black hover:bg-gray-400"
              >
                {loadingJoin ? "Checking..." : "Join Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
      {open2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-opacity-100">
          <div className="bg-[#0A0A0A] border-[1px] border-[#232323] text-white rounded-xl  shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-xl mb-1 font-medium">Shedule</h2>
            <p className="text-sm max-w-sm text-[#A1A1A1] mb-4">You can schedule meetings for the future here.</p>
            <div className="flex justify-center items-center my-10 "> <p className="text-2xl max-w-sm font-bold text-white mb-4">This feature is in development</p>
            </div>
            <div className="flex justify-end">
            <button
                onClick={() => setOpen2(false)}
                className="px-4  py-2 bg-[#151515] transition-all duration-100 hover:bg-[#383838] border-[1px] border-[#383838] rounded-lg "
              >
                Cancel
              </button>
            </div>
            
          </div>
        </div>
      )}
      <div className="px-6 mx-auto">
      <div className="flex flex-col mb-8 mt-5 gap-2">
        <h1 className="text-2xl text-gray-200 font-semibold">
          Welcome, {user?.fullname || "User"} 👋
        </h1>
        <p className="text-gray-400 text-md">
          Ready to record your next important conversation?
        </p>
      </div>
      
      <div className="flex gap-10 text-gray-200 my-15 justify-between w-full ">
        <div className="bg-[#0A0A0A] gap-5  flex rounded-md flex-col border-[1px] w-sm border-[#2C2C2C] px-3 py-4 ">
          <div className="flex items-center justify-between gap-3">
            <div className=" flex gap-2 flex-col">
              <h1 className="text-md font-semibold ">Start New Meeting</h1>
              <p className="text-sm text-[#A3A3A3] max-w-55">Create a meeting room and invite participants</p>
            </div>
            <div className="rounded-full size-14 flex justify-center items-center"><FaPlus className="text-gray-500 text-3xl" /></div>
          </div>
          <button
            onClick={() => {setOpen(true)}}
            className="w-full hover:bg-gray-100 hover:shadow-xl hover:shadow-gray-800 transition-all duration-300 ease-in-out cursor-pointer h-fit bg-gray-300 text-black font-medium text-center py-2 rounded-md"
          >
            Create Meeting
          </button>
        </div>
        <div className="bg-[#0A0A0A] gap-5  flex rounded-md flex-col border-[1px] w-sm border-[#2C2C2C] px-3 py-4 ">
          <div className="flex items-center justify-between gap-3">
            <div className=" flex gap-2 flex-col">
              <h1 className="text-md font-semibold ">Join Meeting</h1>
              <p className="text-sm text-[#A3A3A3] max-w-55">Join an existing meeting with room ID</p>
            </div>
            <div className="rounded-full size-14 flex justify-center items-center "><Users className="text-gray-500 text-3xl" /></div>
          </div>
          <button onClick={() => {setOpen1(true)}}
 className="w-full hover:bg-gray-100 hover:shadow-xl hover:shadow-gray-800 transition-all duration-300 ease-in-out bg-gray-300 text-black cursor-pointer text-center font-medium py-2 rounded-md">Join Meeting</button>
        </div>
        <div className="bg-[#0A0A0A] gap-5  flex rounded-md flex-col border-[1px] w-sm border-[#2C2C2C] px-3 py-4 ">
          <div className="flex items-center justify-between gap-3">
            <div className=" flex gap-2 flex-col">
              <h1 className="text-md font-semibold ">Schedule</h1>
              <p className="text-sm text-[#A3A3A3] max-w-55">View and manage upcoming meetings</p>
            </div>
            <div className="rounded-full size-14 flex justify-center items-center "><GrSchedule className="text-gray-500 text-2xl" /></div>
          </div>
          <button 
             onClick={() => {setOpen2(true)}}
            className="w-full hover:bg-gray-100 hover:shadow-xl hover:shadow-gray-800 transition-all duration-300 ease-in-out bg-gray-300 text-black cursor-pointer text-center font-medium py-2 rounded-md">View Schedule</button>
        </div>
      </div>

      <div className="my-6">
        <h1 className="text-2xl font-semibold text-gray-200 ">Analytics</h1>
        <div className=" text-gray-200 mt-5 px-10 flex gap-20">
          <div className="flex  flex-col">
            <div className="flex mb-1 gap-5 justify-between"><h1 className="text-lg">Total Meetings</h1><PiVideoConference  className="text-2xl"/></div>
            <h1 className="text-xl pl-3 font-bold">{meetings.length}</h1>
            <p className="text-gray-400 text-sm">of all time</p>
          </div>
          <div className="flex flex-col">
            <div className="flex mb-1 gap-5 justify-between"><h1 className="text-lg">Total Duration</h1><CiTimer  className="text-2xl"/></div>
            <h1 className="text-xl pl-3 font-bold">{meetings.length}</h1>
            <p className="text-gray-400 text-sm">Across all hosted meetings</p>
          </div>          
          <div className="flex flex-col">
            <div className="flex mb-1 gap-5 justify-between"><h1 className="text-lg">Storage Used</h1><GrStorage  className="text-2xl"/></div>
            <h1 className="text-xl pl-3 font-bold">{meetings.length}</h1>
            <p className="text-gray-400 text-sm">Storage used of server</p>
          </div>        
        </div>
      </div>
      <div className="my-15">
        <div className=" flex justify-between">
        <h1 className="text-2xl font-semibold text-gray-200 ">Recent Meetings</h1>
        <div className="relative"> <input
          type="text"
          placeholder="Search by title"
          className="px-3 text-gray-400  py-1 rounded-full hover:outline-[1px] hover:outline-offset-2 hover:outline-gray-500 placeholder:text-[#2C2C2C] focus:outline-2 focus:outline-offset-2 focus:outline-gray-500 active:bg-gray-500 placeholder:text-[0.9rem] border-[1px] border-[#2C2C2C] w-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IoIosSearch className="absolute right-2 text-xl text-gray-500 top-2" /></div>
        <div>view</div>
        </div>
        <div className=" text-gray-200 mt-5 gap-5 px-10 flex flex-col">
          {filteredMeetings.length === 0 ? (
            <div>No meeting found</div>
          ) : (
            <ul>
              {filteredMeetings.map((meeting) => (
                <div className="w-full items-center flex px-5 py-2 rounded-md border-[1px] border-[#2C2C2C] bg-[#0A0A0A] justify-between h-25 ">
                <div className="flex items-center gap-5">
                  <div className="size-15 border-[1px] rounded-md"></div>
                  <div className="flex flex-col gap-1">
                    <div className="text-lg items-center flex gap-5"><h1>{meeting.title}</h1>
                      <div className="text-[0.8rem] flex items-center h-fit px-4  bg-green-800 text-green-400 rounded-full">{meeting.status}</div>
                    </div>
                    <div className="flex text-[#A3A3A3] gap-3">
                      <div className="gap-1 flex">
                      <GrFormSchedule className="text-lg" />
                        <h1 className="text-[0.8rem]">{new Date(meeting.createdAt).toLocaleString()}
                        </h1>
                      </div>
                      <div className="gap-1 flex">
                      <IoMdTime className="text-lg" />
                        <h1 className="text-[0.8rem]">{meeting.durationMs ? `${meeting.durationMs} Minutes` : "Not available"}</h1>
                      </div>
                      <div className="gap-1 flex">
                      <FaUsers className="text-md" />
                        <h1 className="text-[0.8rem]">3 Participants</h1>
                      </div>
                    </div>
                    <div className="text-[0.8rem] text-[#A3A3A3]">
                      Participants: Aman Yadav, Laksh Sharma, Nishant Saini, Arbaaz Khan
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 h-fit">
                  <button className="flex cursor-pointer rounded-md hover:bg-[#2C2C2C]  gap-2 items-center border-[1px] border-[#2C2C2C] px-4 py-1.5">
                    <FaPlay />
                    <h1>Play</h1>
                  </button>
                  <button className="flex cursor-pointer rounded-md hover:bg-[#2C2C2C]  gap-2 items-center border-[1px] border-[#2C2C2C] px-4 py-1.5">
                  <FiDownload className="text-xl"/>
                    <h1>Download</h1>
                  </button>              
                  <button className="flex rounded-md cursor-pointer hover:bg-[#2C2C2C]  gap-2 items-center border-[1px] border-[#2C2C2C] px-4 py-1.5">
                  <IoShareSocialSharp  className="text-xl"/>
                    <h1>Share</h1>
                  </button>            
                </div>
              </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardPage;