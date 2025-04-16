import { Calendar, Clock, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import config from '@/config/config';
import { formatEventDate } from '@/lib/formatEventDate';
import { Helmet } from 'react-helmet'; // Adicionado para preload das imagens
import foto1 from '../photos/foto1.JPG';
import foto2 from '../photos/foto4.JPG';
import foto3 from '../photos/foto5.JPG';

const images = [foto1, foto2, foto3];

export default function Hero() {
    const [guestName, setGuestName] = useState('');
    const [mainEmoji, setMainEmoji] = useState("🌻");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const guestParam = urlParams.get('guest');

        if (guestParam) {
            setGuestName(decodeURIComponent(guestParam));
        }
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const sequence = ["🌻", "💛"];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % sequence.length;
            setMainEmoji(sequence[index]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const CountdownTimer = ({ targetDate }) => {
        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
        function calculateTimeLeft() {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutos: Math.floor((difference / 1000 / 60) % 60),
                    segundos: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        }
        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearInterval(timer);
        }, [targetDate]);

        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {Object.keys(timeLeft).map((interval) => (
                    <div
                        key={interval}
                        className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-yellow-100 transition-all duration-500"
                    >
                        
                        <span className="text-xl sm:text-2xl font-bold text-yellow-600">
                            {timeLeft[interval]}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{interval}</span>
                    </div>
                ))}
            </div>
        );
    };

    const FloatingHearts = () => {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight
                        }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1, 1, 0.5],
                            x: Math.random() * window.innerWidth,
                            y: -100
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeOut"
                        }}
                        className="absolute"
                    >
                        <Heart
                            className={`w-${Math.floor(Math.random() * 2) + 8} h-${Math.floor(Math.random() * 2) + 8} ${i % 3 === 0 ? 'text-yellow-500' :
                                i % 3 === 1 ? 'text-yellow-400' :
                                    'text-yellow-300'
                                }`}
                            fill="currentColor"
                        />
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Helmet>
              <link rel="preload" as="image" href={foto1} />
              <link rel="preload" as="image" href={foto2} />
              <link rel="preload" as="image" href={foto3} />
            </Helmet>
            <section id="home" className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden">
                {import.meta.env.VITE_AMBIENTE === 'HML' && (
                    <div className="bg-red-600 text-white text-center py-4 px-4 mb-6 shadow-md w-full">
                        <h2 className="text-lg sm:text-2xl font-bold uppercase">AMBIENTE DE HOMOLOGAÇÃO</h2>
                        <p className="text-xs sm:text-sm mt-1">
                          Esta página é destinada apenas para testes. As confirmações feitas aqui não afetarão a lista oficial de convidados.
                        </p>
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 relative z-10"
                >
                    <motion.h2
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl sm:text-5xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-500"
                        >
                            {config.data.groomName} & {config.data.brideName}
                        </motion.h2>
                        
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <motion.span
                            key={mainEmoji}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl"
                          >
                            {mainEmoji}
                          </motion.span>
                        </motion.div>

                    <div className="space-y-4">
                    <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 max-w-md mx-auto space-y-2"
                        >
                            <p className="text-center">
                                “Quanto à promessa que fizemos um ao outro, o Senhor é testemunha para sempre.”
                            </p>
                            <p className="text-center text-sm text-gray-400">
                                1 Sm. 20:23
                            </p>
                        </motion.div>
                        
                        

                        <div className="relative flex justify-center mt-8">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            alt="Foto do casal"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                            className="w-full max-w-2xl h-auto rounded-xl object-cover shadow-md border-4 border-yellow-200"
                          />
                        </div>
<motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 font-light italic text-base sm:text-lg"
                        >
                            Nós vamos nos casar!
                        </motion.p>
                        <CountdownTimer targetDate={config.data.date} />
                        
                    </div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mx-auto"
                    >
                        <span className="px-4 py-1 text-sm bg-yellow-50 text-yellow-600 rounded-full border border-yellow-200">
                            #SaveTheDate 🌻
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="relative max-w-md mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-white/50 backdrop-blur-md rounded-2xl" />

                        <div className="relative px-4 sm:px-8 py-8 sm:py-10 rounded-2xl border border-yellow-100/50">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-yellow-200 to-transparent" />
                            </div>

                            <div className="space-y-6 text-center">
                                <div className="space-y-3">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.9 }}
                                        className="flex items-center justify-center space-x-2"
                                    >
                                        <Calendar className="w-4 h-4 text-yellow-500" />
                                        <span className="text-gray-700 font-medium text-sm sm:text-base">
                                            {formatEventDate(config.data.date, "full")}
                                        </span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="flex items-center justify-center space-x-2"
                                    >
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        <span className="text-gray-700 font-medium text-sm sm:text-base">
                                            {config.data.time}
                                        </span>
                                    </motion.div>
                                </div>

                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-px w-8 sm:w-12 bg-yellow-200/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-200" />
                                    <div className="h-px w-8 sm:w-12 bg-yellow-200/50" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.1 }}
                                    className="space-y-2"
                                >
                                        <p className="text-gray-500 font-serif italic text-sm">
                                            Querido(a) 🌻
                                        </p>
                                        <p className="text-yellow-600 font-semibold text-2xl sm:text-3xl">
                                            {guestName ? guestName : "Convidado"}
                                        </p>
                                </motion.div>
                            </div>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-px">
                                <div className="w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-yellow-200 to-transparent" />
                            </div>
                        </div>

                        <div className="absolute -top-2 -right-2 w-16 sm:w-24 h-16 sm:h-24 bg-yellow-100/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-2 -left-2 w-16 sm:w-24 h-16 sm:h-24 bg-yellow-100/20 rounded-full blur-xl" />
                    </motion.div>


                    <div className="pt-6 relative">
                        <FloatingHearts />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Heart className="w-10 sm:w-12 h-10 sm:h-12 text-yellow-500 mx-auto" fill="currentColor" />
                        </motion.div>
                    </div>
                </motion.div>
            </section>
        </>
    )
}
