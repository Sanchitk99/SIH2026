import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Volume2 } from 'lucide-react';

export default function Safety() {
  const safetyRules = [
    { title: "Do Not Burn Cables", desc: "Burning plastic-coated wires releases highly toxic dioxins and hazardous smoke.", icon: ShieldAlert, color: "text-red-500 bg-red-50" },
    { title: "Handle Batteries Carefully", desc: "Lithium-ion and lead-acid batteries can short-circuit, catch fire, or leak corrosive acid.", icon: AlertTriangle, color: "text-amber-500 bg-amber-50" },
    { title: "Keep Items Dry", desc: "Store e-waste in a dry covered area to prevent chemical leaching into the soil.", icon: CheckCircle2, color: "text-green-500 bg-green-50" }
  ];

  const handleAudioAssist = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-md">
        <h1 className="text-2xl font-bold mb-1">Safety First</h1>
        <p className="text-amber-100">Follow these critical safety guidelines when collecting and handling e-waste.</p>
      </div>

      <div className="space-y-4">
        {safetyRules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-xl ${rule.color}`}><Icon size={24} /></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-lg">{rule.title}</h3>
                  <button onClick={() => handleAudioAssist(`${rule.title}. ${rule.desc}`)} className="text-gray-400 hover:text-green-600 p-1" title="Listen">
                    <Volume2 size={20} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-1">{rule.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}