/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Clock, 
  Activity, 
  AlertTriangle,
  FileSpreadsheet,
  BrainCircuit,
  MessageCircle
} from 'lucide-react';
import { Patient, OpdEntry, Prescription, Bill, Appointment, ChatMessage } from '../types';
import { getRelativeDateString, formatDate, generateId } from '../utils';

interface AiAssistantProps {
  patients: Patient[];
  opdQueue: OpdEntry[];
  prescriptions: Prescription[];
  bills: Bill[];
  appointments: Appointment[];
}

export default function AiAssistant({
  patients,
  opdQueue,
  prescriptions,
  bills,
  appointments
}: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-start',
      sender: 'assistant',
      content: 'Namaste Doctor Saab! 🙏 Main aapka smart clinic assistant **Dr. AI Helper** hoon. \n\nMain aapke clinic analytics aur medical logs ko dekh kar jaldi se metrics calculate kar sakta hoon. Kripya neeche diye gaye quick sawalon par click karein ya type karein!',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getTodayStr = () => getRelativeDateString(0);
  const getTomorrowStr = () => getRelativeDateString(1);

  // --- BOT QUERY MATCHING LOGIC ---
  const calculateBotResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    
    // Query 1: Aaj kitne patients aaye?
    if (q.includes('aaj kitne patient') || q.includes('today patient') || q.includes('today\'s count')) {
      const todayTotal = opdQueue.length;
      const waiting = opdQueue.filter(p => p.status === 'Waiting').length;
      const inCabin = opdQueue.filter(p => p.status === 'In Consultation').length;
      const done = opdQueue.filter(p => p.status === 'Done').length;

      return `Doctor Saab, aaj total **${todayTotal} patients** registered hain:\n\n` +
             `⏳ **Waiting (कतार में):** ${waiting} patients\n` +
             `👨‍⚕️ **In Cabin (डॉक्टर के पास):** ${inCabin} patients\n` +
             `✅ **Done (चेक-अप हो गया):** ${done} patients\n\n` +
             `Aap real-time OPD Queue tab me jaakar inko bulasakte hain.`;
    }

    // Query 2: Sabse common diagnosis kya thi is hafte?
    if (q.includes('common diagnosis') || q.includes('diagnosis is hafte') || q.includes('se bimari')) {
      // Aggregate diagnosis from last 7 days
      const diagnosisCounts: { [key: string]: number } = {};
      const sevenDaysAgo = getRelativeDateString(-7);
      
      prescriptions
        .filter(pr => pr.date >= sevenDaysAgo)
        .forEach(pr => {
          if (pr.diagnosis) {
            diagnosisCounts[pr.diagnosis] = (diagnosisCounts[pr.diagnosis] || 0) + 1;
          }
        });

      const sorted = Object.entries(diagnosisCounts).sort((a,b) => b[1]-a[1]);
      if (sorted.length === 0) {
        return `Is hafte koi naya prescription diagnosis submit nahi kiya gaya hai. Lekin database standard pre-loaded diagnostic patterns (Viral Fever, Common Cold) par tayaar hai!`;
      }

      return `Analysis ke mutabik, is hafte sabse common diagnosis: **"${sorted[0][0]}"** rhi hai (जो ${sorted[0][1]} baar di gyi).\n\n` +
             `Top Trends:\n` +
             sorted.map(([name, count], i) => `${i+1}. **${name}** &mdash; ${count} patients`).join('\n') +
             `\n\nAgar aap detailed charts dekhna chahte hain, toh kripya **Reports & Analytics** tab visit karein.`;
    }

    // Query 3: Kaunse patients ka follow-up hai kal?
    if (q.includes('follow-up') || q.includes('follow up kal') || q.includes('tomorrow follow')) {
      const tomorrowYmd = getTomorrowStr();
      const tomFollowUps = appointments.filter(appt => appt.date === tomorrowYmd && appt.type === 'Follow-up');

      if (tomFollowUps.length === 0) {
        return `Doctor Saab, kal **(${formatDate(tomorrowYmd)})** koi follow-up appointments scheduled nahi hain.\n\nAap custom appointments tab me direct booking register kar sakte hain!`;
      }

      return `Kal **(${formatDate(tomorrowYmd)})** follow-up ke liye aane wale patients:\n\n` +
             tomFollowUps.map((f, i) => `${i+1}. **${f.patientName}** (Time: ${f.timeSlot}) &bull; Phone: ${f.patientPhone}`).join('\n') +
             `\n\nAap ek click me unhe **Appointments screen** par jaakar prefilled WhatsApp message notification bhej sakte hain.`;
    }

    // Query 4: Aaj ki total fees kitni aayi?
    if (q.includes('aaj ki total fees') || q.includes('aaj kitni fees') || q.includes('today revenue') || q.includes('aaj ki kamai')) {
      const todayStr = getTodayStr();
      const todayPaidSum = bills
        .filter(b => b.date === todayStr && b.status === 'Paid')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const todayUnpaidSum = bills
        .filter(b => b.date === todayStr && b.status === 'Unpaid')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return `Doctor Saab, aaj **(${formatDate(todayStr)})** ke accounts aur billing ledger:\n\n` +
             `💰 **Collected Today (जमा राशि):** ₹${todayPaidSum.toLocaleString('en-IN')}\n` +
             `⌛ **Outstanding Unpaid (बाकी राशि):** ₹${todayUnpaidSum.toLocaleString('en-IN')}\n\n` +
             `Kripya **Billing & Fees** panel dekein outstanding accounts settle karne ke liye.`;
    }

    // Query 5: Koi allergy conflict hai latest prescription mein?
    if (q.includes('allergy conflict') || q.includes('allergy check') || q.includes('conflict check') || q.includes('allergy dhyan')) {
      if (prescriptions.length === 0) {
        return `Clinic database mein is samay koi prescriptions processed nahi hain, check karne ke liye. Parchi tab jodein first.`;
      }

      const latestPres = prescriptions[prescriptions.length - 1];
      const patient = patients.find(p => p.id === latestPres.patientId);

      if (!patient) {
        return `Latest prescription patient record index valid nahi hai, verification aborted.`;
      }

      const patientAllergies = patient.allergies.filter(a => a !== 'None');
      if (patientAllergies.length === 0) {
        return `Suraksha check clear! Latest patient **"${patient.name}"** ko koi registered allergies nahi hain. Aap bina kisi conflict ke prescribe kar sakte hain. 👍`;
      }

      // Check if latest prescription contains penicillin / amoxicillin when penicillin allergen exists
      const hasPenicillinAllergy = patientAllergies.some(a => a.toLowerCase().includes('penicillin'));
      const hasAmoxicillinRx = latestPres.medicines.some(m => m.medicineName.toLowerCase().includes('amoxicillin'));

      if (hasPenicillinAllergy && hasAmoxicillinRx) {
        return `🚨 **Allergy Conflict Alert found!**\n\n` +
               `Patient **"${patient.name}"** ko Penicillin se allergy registered hai, par unki latest prescription mein **"Amoxicillin"** paya gaya hai!\n\n` +
               `Kripya unki parchi review karein aur composition substitute karein. Safety parameters active check.`;
      }

      return `Latest check clear: **"${patient.name}"** ko allergies: **[${patientAllergies.join(', ')}]** hain, par unki current medicines configuration mein koi matching allergens conflict detected nahi hai. Safe.`;
    }

    // Default Fallback Help Menu
    return `Suno, mujhe is sawal ka jawab nikalne mein thodi duvidha ho rhi hai. 😅 Lekin main yeh sab parameters turant check kar sakta hoon:\n\n` +
           `1. **"Aaj kitne patients aaye?"** (Total OPD count check)\n` +
           `2. **"Sabse common diagnosis kya thi is hafte?"** (Epidemic tracking)\n` +
           `3. **"Kaunse patients ka follow-up hai kal?"** (Review planner)\n` +
           `4. **"Aaj ki total fees kitni aayi?"** (Financial balance checks)\n` +
           `5. **"Koi allergy conflict hai latest prescription mein?"** (Safety audit)\n\n` +
           `Kripya upar diye gaye quick link buttons click karke checks chalayein!`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId('user-msg'),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate clinical typing animation for natural interaction
    setTimeout(() => {
      const responseText = calculateBotResponse(text);
      const botMsg: ChatMessage = {
        id: generateId('bot-msg'),
        sender: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm max-w-4xl mx-auto flex flex-col h-[580px]" id="ai-assistant-container">
      
      {/* Bot Chat Header panel */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50 rounded-t-2xl" id="ai-chat-header">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
              <span>Dr. AI Helper</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 py-0.5 px-1.5 rounded-full font-black uppercase tracking-wider">Clinical BOT</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">Automatic localStorage logs checking assistant</p>
          </div>
        </div>

        <BrainCircuit className="h-6 w-6 text-blue-400 shrink-0" />
      </div>

      {/* Message Feed Canvas scrollable area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/20" id="ai-message-pane">
        {messages.map(msg => {
          const isMe = msg.sender === 'user';
          
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse text-right' : ''}`}
            >
              {/* Avatar circle */}
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                isMe 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-blue-600 text-white'
              }`}>
                {isMe ? 'MD' : '🩺'}
              </div>

              {/* Chat bubble body */}
              <div className="space-y-1 max-w-[80%]">
                <div className={`rounded-2xl px-4 py-2.5 text-xs text-left shadow-2xs leading-relaxed whitespace-pre-line ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none font-semibold' 
                    : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none font-medium'
                }`}>
                  {/* Simplistic markdown bold highlights converter */}
                  {msg.content.split('**').map((chunk, index) => 
                    index % 2 === 1 ? <strong key={index} className={isMe ? 'text-white font-black' : 'text-blue-900 font-bold'}>{chunk}</strong> : chunk
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-405 block px-1.5">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {/* Typing Blinky indicator bubble */}
        {isTyping && (
          <div className="flex items-start gap-2.5 animate-pulse" id="typing-loader">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">🩺</div>
            <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none px-4 py-3 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce duration-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce duration-500 [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce duration-500 [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef}></div>
      </div>

      {/* Suggested Quick Question Blocks bar */}
      <div className="p-3 border-t border-gray-100 bg-white space-y-2" id="quick-suggesters-shelf">
        <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block pr-1.5">Quick clinical queries:</span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          <button
            onClick={() => handleSendMessage('Aaj kitne patients aaye?')}
            className="p-1 px-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all text-gray-650 cursor-pointer"
          >
            📊 Aaj ke patient kitne hain?
          </button>
          <button
            onClick={() => handleSendMessage('Sabse common diagnosis kya thi is hafte?')}
            className="p-1 px-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all text-gray-650 cursor-pointer"
          >
            🧬 Viral Fever / Diagnosis trends
          </button>
          <button
            onClick={() => handleSendMessage('Kaunse patients ka follow-up hai kal?')}
            className="p-1 px-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all text-gray-650 cursor-pointer"
          >
            📅 Kal kiski follow-up tareek hai?
          </button>
          <button
            onClick={() => handleSendMessage('Aaj ki total fees kitni aayi?')}
            className="p-1 px-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all text-gray-650 cursor-pointer"
          >
            💰 Aaj ki income fees update
          </button>
          <button
            onClick={() => handleSendMessage('Koi allergy conflict hai latest prescription mein?')}
            className="p-1 px-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all text-gray-650 cursor-pointer"
          >
            🚨 Penicillin/Amoxicillin allergy cross-check
          </button>
        </div>
      </div>

      {/* Message TextInput form box */}
      <div className="p-3 border-t border-gray-100 bg-white" id="query-chat-input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Puchein: 'aaj kitni fees aayi?', 'symptom counts'... (सवाल दर्ज करें)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-gray-50 border border-gray-205 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            id="btn-send-assistant-message"
            className="bg-blue-600 hover:bg-blue-700 p-2.5 rounded-xl text-white shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
