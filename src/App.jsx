import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Calendar, Home, BookOpen, User, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

const SeumApp = () => {
  const [currentPage, setCurrentPage] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recordings, setRecordings] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [images, setImages] = useState({});
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const playingAudioRef = useRef(null);

  useEffect(() => {
    const imageFiles = [
      { key: 'logo', filename: 'logo.png', path: '/image/' },
      { key: '화나', filename: 'angry.png', path: '/image/emotions/' },
      { key: '최고야', filename: 'best.png', path: '/image/emotions/' },
      { key: '괜찮네', filename: 'normal.png', path: '/image/emotions/' },
      { key: '사랑해', filename: 'love.png', path: '/image/emotions/' },
      { key: '평범해', filename: 'normal.png', path: '/image/emotions/' },
      { key: '힘들어', filename: 'tired.png', path: '/image/emotions/' },
      { key: '슬펴', filename: 'sad.png', path: '/image/emotions/' },
      { key: '두근두근해', filename: 'excited.png', path: '/image/emotions/' }
    ];
  
    const loadedImages = {};
    imageFiles.forEach(({ key, filename, path }) => {
      const fullPath = `${path}${filename}`;
      
      // 브라우저에서 실제 이미지가 로드 가능한지 테스트
      const img = new Image();
      img.src = fullPath;
      img.onload = () => {
        loadedImages[key] = fullPath;
        // 로딩된 이미지들만 업데이트
        setImages(prev => ({ ...prev, [key]: fullPath }));
      };
      img.onerror = () => {
        console.warn(`이미지 로드 실패: ${fullPath}`);
      };
    });
  }, []);  
  

  const moods = [
    { emoji: '사랑해', label: '사랑해', color: '#FFB3D1' },
    { emoji: '두근두근해', label: '두근두근해', color: '#FFE066' },
    { emoji: '최고야', label: '최고야', color: '#FFE066' },
    { emoji: '괜찮네', label: '괜찮네', color: '#FFE066' },
    { emoji: '평범해', label: '평범해', color: '#FFE066' },
    { emoji: '슬펴', label: '슬펴', color: '#B3D9FF' },
    { emoji: '힘들어', label: '힘들어', color: '#D1C4E9' },
    { emoji: '화나', label: '화나', color: '#FFB3B3' }
  ];

  // 타이머 효과
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Recording failed:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // 오디오 재생
  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // 녹음 저장 (React state 사용)
  const saveRecording = () => {
    if (audioUrl && selectedMood) {
      const dateKey = currentDate.toISOString().split('T')[0];
      
      setRecordings(prev => ({
        ...prev,
        [dateKey]: { 
          mood: selectedMood, 
          moodImage: images[selectedMood],
          audioUrl, 
          date: new Date(),
          duration: recordingTime
        }
      }));
      
      // 리셋
      setAudioUrl(null);
      setSelectedMood('');
      setRecordingTime(0);
      alert('🎉 녹음이 저장되었습니다!');
    }
  };

  // 날짜별 녹음 가져오기
  const getDayRecording = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return recordings[dateKey];
  };

  // 저장된 녹음 재생
  const playDayRecording = (recording) => {
    // 이전 재생 중지
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
    }
    
    // 새 오디오 객체 생성 및 재생
    const audio = new Audio(recording.audioUrl);
    playingAudioRef.current = audio;
    
    audio.play().then(() => {
      alert(`${recording.mood} 기분의 녹음을 재생합니다! 🎵`);
    }).catch(error => {
      console.error('재생 실패:', error);
      alert('녹음 재생에 실패했습니다.');
    });
  };

  // 달력 렌더링
  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayRecording = getDayRecording(current);
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const isSelected = current.toDateString() === selectedDate.toDateString();
      
      days.push(
        <div
          key={i}
          className={`h-12 w-12 flex items-center justify-center relative cursor-pointer rounded-lg transition-all ${
            isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
          } ${isToday ? 'bg-blue-100 font-bold' : ''} ${
            isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''
          } ${dayRecording ? 'hover:bg-green-50' : 'hover:bg-gray-50'}`}
          onClick={() => {
            setSelectedDate(new Date(current));
            if (dayRecording) {
              playDayRecording(dayRecording);
            }
          }}
        >
          <span className={`text-sm ${current.getDay() === 0 ? 'text-red-500' : current.getDay() === 6 ? 'text-blue-500' : ''}`}>
            {current.getDate()}
          </span>
          {dayRecording && (
            <div className="absolute -bottom-1 -right-1">
              <img 
                src={dayRecording.moodImage || images[dayRecording.mood]} 
                alt={dayRecording.mood}
                className="w-6 h-6 rounded-full"
              />
            </div>
          )}
        </div>
      );
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 3개월 전 같은 날짜 데이터 가져오기
  const getThreeMonthsAgoData = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return getDayRecording(threeMonthsAgo);
  };

  // 월 변경
  const changeMonth = (direction) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  const RecordingPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">목소리 상자(녹음기)</h1>
      
      <div className="relative mb-8">
        <div className="w-64 h-64 bg-gradient-to-r from-green-200 to-green-300 rounded-full flex items-center justify-center shadow-lg">
          <div className={`w-48 h-48 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500'} rounded-full flex items-center justify-center shadow-inner transition-all`}>
            <Mic className="w-16 h-16 text-white" />
          </div>
        </div>
        
        {isRecording && (
          <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-8">
            <div className="flex items-center space-x-1">
              {Array.from({length: 20}).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-mono mb-6 text-gray-700 font-bold">
        {formatTime(recordingTime)}
      </div>
      
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 ${isRecording ? 'bg-red-200 hover:bg-red-300' : 'bg-green-200 hover:bg-green-300'} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all`}
        >
          {isRecording ? <Pause className="w-8 h-8 text-gray-700" /> : <Play className="w-8 h-8 text-gray-700" />}
        </button>
      </div>
      
      {audioUrl && (
        <div className="w-full max-w-md mb-6">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <button
            onClick={playAudio}
            className="w-full bg-green-100 hover:bg-green-200 p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {isPlaying ? <Pause /> : <Play />}
            <span>녹음 재생 ({formatTime(recordingTime)})</span>
          </button>
        </div>
      )}
      
      <div className="bg-green-100 p-6 rounded-lg w-full max-w-md">
        <p className="text-center mb-4 text-gray-700 font-medium">기분이 어때?</p>
        <div className="grid grid-cols-4 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedMood === mood.label 
                  ? 'bg-white shadow-lg scale-105 ring-2 ring-green-400' 
                  : 'bg-white/50 hover:bg-white hover:shadow-md hover:scale-102'
              }`}
            >
              <div className="flex justify-center mb-1">
                {images[mood.emoji] ? (
                  <img 
                    src={images[mood.emoji]} 
                    alt={mood.label}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">?</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600">{mood.label}</div>
            </button>
          ))}
        </div>
        
        {audioUrl && selectedMood && (
          <button
            onClick={saveRecording}
            className="w-full mt-4 bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
          >
            💾 저장하기
          </button>
        )}
      </div>
    </div>
  );

  const CalendarPage = () => {
    const selectedRecording = getDayRecording(selectedDate);
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">
                  {calendarMonth.getFullYear()}년 {monthNames[calendarMonth.getMonth()]}
                </h2>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={`text-center text-sm font-medium p-2 ${
                    day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                  {selectedRecording ? (
                    <img 
                      src={selectedRecording.moodImage || images[selectedRecording.mood]} 
                      alt={selectedRecording.mood}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="text-3xl">📅</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    선택된 날짜: {selectedDate.getMonth() + 1}.{selectedDate.getDate()} 
                    {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}
                  </p>
                  {selectedRecording && (
                    <p className="text-sm text-gray-500">
                      기분: {selectedRecording.mood} · 시간: {formatTime(selectedRecording.duration)}
                    </p>
                  )}
                </div>
              </div>
              
              {selectedRecording ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">저장된 음성 일기</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {Array.from({length: 30}).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded"
                          style={{height: `${Math.random() * 30 + 10}px`}}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => playDayRecording(selectedRecording)}
                      className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>음성 일기 재생</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <div className="text-4xl mb-4">🎤</div>
                  <p className="text-gray-600">이 날에는 저장된 음성 일기가 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-2">목소리 상자에서 새로운 일기를 만들어보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AchievementPage = () => {
    const threeMonthsAgoData = getThreeMonthsAgoData();
    const totalRecordings = Object.keys(recordings).length;
    const moodCounts = {};
    
    // 기분별 통계 계산
    Object.values(recordings).forEach(recording => {
      moodCounts[recording.mood] = (moodCounts[recording.mood] || 0) + 1;
    });
    
    const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">과거의 나는?</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 3개월 전 비교 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">3개월 전 오늘</h2>
              {threeMonthsAgoData ? (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <img 
                      src={threeMonthsAgoData.moodImage || images[threeMonthsAgoData.mood]} 
                      alt={threeMonthsAgoData.mood}
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{threeMonthsAgoData.mood}</h3>
                  <p className="text-gray-600 mb-4">그때의 기분이었어요!</p>
                  <button
                    onClick={() => playDayRecording(threeMonthsAgoData)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>3개월 전 일기 듣기</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <p className="text-gray-600">3개월 전 데이터가 없습니다.</p>
                </div>
              )}
            </div>
            
            {/* 통계 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">나의 기록</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{totalRecordings}</div>
                  <p className="text-gray-600">총 녹음 개수</p>
                </div>
                
                {mostFrequentMood && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                      <img 
                        src={images[mostFrequentMood[0]]} 
                        alt={mostFrequentMood[0]}
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div className="font-bold text-lg">{mostFrequentMood[0]}</div>
                    <p className="text-gray-600">가장 많은 기분 ({mostFrequentMood[1]}번)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 최근 기록들 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">최근 기록들</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(recordings)
                .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))
                .slice(0, 7)
                .map(([date, recording]) => (
                  <div
                    key={date}
                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => playDayRecording(recording)}
                  >
                    <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center">
                      <img 
                        src={recording.moodImage || images[recording.mood]} 
                        alt={recording.mood}
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(date).getMonth() + 1}/{new Date(date).getDate()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <img 
                src="/image/logo.png" 
                alt="SEUM Logo"
                className="h-8 w-auto"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                SEUM
              </h1>
            </div>
            <nav className="flex space-x-6">
              <button
                onClick={() => setCurrentPage('record')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'record' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                목소리 상자
              </button>
              <button
                onClick={() => setCurrentPage('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'calendar' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                말하는 다이어리
              </button>
              <button
                onClick={() => setCurrentPage('achievement')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'achievement' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                과거의 나
              </button>
            </nav>
          </div>
        </div>
      </header>
  
      {/* Main Content */}
      <main>
        {currentPage === 'record' && <RecordingPage />}
        {currentPage === 'calendar' && <CalendarPage />}
        {currentPage === 'achievement' && <AchievementPage />}
      </main>
    </div>
  );
  };
  
  export default SeumApp;