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
import { useState, useEffect } from 'react';
import { formatEventDate } from '@/lib/formatEventDate';

export default function Wishes() {
    const [showConfetti, setShowConfetti] = useState(false);
    const [newWish, setNewWish] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendance, setAttendance] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [guestNames, setGuestNames] = useState([]);
    const [peopleCount, setPeopleCount] = useState(1);

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

    useEffect(() => {
        setGuestNames(Array.from({ length: peopleCount }, (_, index) => guestNames[index] || ''));
    }, [peopleCount]);

    const handleSubmitWish = async (e) => {
        e.preventDefault();

        const form = e.target;
        const nome = form.name.value;
        const email = form.email.value;
        const confirmado = form.confirm.value;

        const nomes_individuais = [nome, ...guestNames.slice(1)];
        const pessoas = nomes_individuais.length;
        const valorPix = pessoas * 200;

        try {
            const response = await fetch('https://api-wedding-alpha.vercel.app/api/confirmar.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    pessoas,
                    nomes_individuais,
                    confirmado,
                    pago: false
                }),
            });

            if (!response.ok) throw new Error('Erro ao enviar confirmação.');

            alert(`Confirmação enviada com sucesso!\nValor do Pix: R$ ${valorPix.toFixed(2)}`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3001);
            setNewWish('');
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao enviar sua confirmação.");
        }
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

            <center><div className="space-y-1">
                            <p className="text-gray-600 italic text-sm">
                            Após realizar o pagamento, confirme sua presença abaixo.  
                            </p>
                        </div></center>
            <div className="container mx-auto px-4 py-15 relative z-10">
                
                {/* Wishes Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-12"
                >
                    <form
                      onSubmit={handleSubmitWish}
                      className="relative"
                    >
                      <div className="backdrop-blur-sm bg-[rgb(254_249_195)] p-6 rounded-2xl border border-yellow-300/50 shadow-lg space-y-4">
                        {/* Nome */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                            <User className="w-4 h-4" />
                            <span>Seu Nome</span>
                          </div>
                          <input
                            name="name"
                            placeholder="Digite seu nome..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
                            required
                          />
                        </div>

                        {/* Número de pessoas */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                            <User className="w-4 h-4" />
                            <span>Quantas pessoas (incluindo você)?</span>
                          </div>
                          <select
                            name="people"
                            value={peopleCount}
                            onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 text-gray-700"
                            required
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Nomes individuais */}
                        {Array.from({ length: peopleCount - 1 }).map((_, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                              <User className="w-4 h-4" />
                              <span>Nome da pessoa {index + 2}</span>
                            </div>
                            <input
                              type="text"
                              value={guestNames[index + 1] || ''}
                              onChange={(e) => {
                                const updatedNames = [...guestNames];
                                updatedNames[index + 1] = e.target.value;
                                setGuestNames(updatedNames);
                              }}
                              placeholder={`Pessoa ${index + 2}`}
                              className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
                              required
                            />
                          </div>
                        ))}

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
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 text-gray-700 placeholder-gray-400"
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
                            className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 text-gray-700"
                          >
                            <option value="">Selecione</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </div>

                        {/* Botão */}
                        <div className="flex items-center justify-end mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 bg-yellow-500 hover:bg-yellow-600"
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
