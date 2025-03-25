import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti';
import Marquee from "@/components/ui/marquee";
import {
    Calendar,
    Clock,
    ChevronDown,
    User,
    MessageCircle,
    Send,
    Smile,
    CheckCircle,
    XCircle,
    HelpCircle,
} from 'lucide-react'
import { useState } from 'react';
import { formatEventDate } from '@/lib/formatEventDate';

export default function Wishes() {
    const [showConfetti, setShowConfetti] = useState(false);
    const [newWish, setNewWish] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendance, setAttendance] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: 'ATTENDING', label: 'Sim, estarei presente' },
        { value: 'NOT_ATTENDING', label: 'Não, não poderei comparecer' },
        { value: 'MAYBE', label: 'Talvez, confirmarei depois' }
    ];
    // Example wishes - replace with your actual data
    const [wishes, setWishes] = useState([
        {
            id: 1,
            name: "John Doe",
            message: "Desejo a vocês uma vida cheia de amor, risos e felicidade! 🎉",
            timestamp: "2024-12-24T23:20:00Z",
            attending: "attending"
        },
        {
            id: 2,
            name: "Natalie",
            message: "Desejo a vocês uma vida cheia de amor, risos e felicidade! 🎉",
            timestamp: "2024-12-24T23:20:00Z",
            attending: "attending"
        },
        {
            id: 3,
            name: "Abdur Rofi",
            message: "Congratulations on your special day! May Allah bless your union! 🤲",
            timestamp: "2024-12-25T23:08:09Z",
            attending: "maybe"
        }
    ]);

    const handleSubmitWish = async (e) => {
        e.preventDefault();
        if (!newWish.trim()) return;

        setIsSubmitting(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newWishObj = {
            id: wishes.length + 1,
            name: "Guest", // Replace with actual user name
            message: newWish,
            attend: "attending",
            timestamp: new Date().toISOString()
        };

        setWishes(prev => [newWishObj, ...prev]);
        setNewWish('');
        setIsSubmitting(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };
    const getAttendanceIcon = (status) => {
        switch (status) {
            case 'attending':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'not-attending':
                return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'maybe':
                return <HelpCircle className="w-4 h-4 text-amber-500" />;
            default:
                return null;
        }
    };
    return (<>
        <section id="wishes" className="min-h-screen relative overflow-hidden">
            {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
            <div className="container mx-auto px-4 py-20 relative z-10">
                
                {/* Wishes Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-12"
                >
                    <form
  onSubmit={(e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const confirm = form.confirm.value;
    const people = parseInt(form.people.value) || 0;
    const total = people * 200;

    const message = `
Confirmação de Presença:
Nome: ${name}
Email: ${email}
Confirma Presença? ${confirm}
Número de Pessoas: ${people}
Total R$: ${total.toFixed(2)}
    `;

    window.location.href = `mailto:joaopedrovsilva102@gmail.com?subject=Confirmação de Presença - ${name}&body=${encodeURIComponent(message)}`;
    alert("Obrigado por confirmar! O valor do Pix é R$ " + total.toFixed(2));
  }}
  className="relative"
>
  <div className="backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-rose-100/50 shadow-lg space-y-4">
    {/* Nome */}
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
        <User className="w-4 h-4" />
        <span>Seu Nome</span>
      </div>
      <input
        name="name"
        placeholder="Digite seu nome..."
        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
        required
      />
    </div>

    {/* Email */}
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
        <MessageCircle className="w-4 h-4" />
        <span>Seu E-mail</span>
      </div>
      <input
        name="email"
        type="email"
        placeholder="Digite seu email..."
        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
        required
      />
    </div>

    {/* Confirma Presença */}
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
        <Calendar className="w-4 h-4" />
        <span>Você irá comparecer?</span>
      </div>
      <select
        name="confirm"
        required
        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 transition-all duration-200 text-gray-700"
      >
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </select>
    </div>

    {/* Número de pessoas */}
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
        <User className="w-4 h-4" />
        <span>Quantas pessoas (incluindo você)?</span>
      </div>
      <input
        name="people"
        type="number"
        min="1"
        max="10"
        placeholder="Ex: 2"
        className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-rose-100 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
        required
      />
    </div>

    {/* Botão */}
    <div className="flex items-center justify-end mt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 bg-rose-500 hover:bg-rose-600"
        type="submit"
      >
        <Send className="w-4 h-4" />
        <span>Confirmar</span>
      </motion.button>
    </div>
  </div>
</form>
                </motion.div>
            </div>
        </section>
    </>)
}
