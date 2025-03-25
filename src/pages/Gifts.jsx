import config from '@/config/config';
import { motion } from 'framer-motion'
import {
    Copy,
    Gift,
    CheckCircle,
    Wallet,
    Building2,
} from 'lucide-react'
import { useState, useEffect } from 'react';

export default function Gifts() {
    const [copiedAccount, setCopiedAccount] = useState(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    
    useEffect(() => {
        setHasAnimated(true);
    }, []);
    
    const copyToClipboard = (text, bank) => {
        navigator.clipboard.writeText(text);
        setCopiedAccount(bank);
        setTimeout(() => setCopiedAccount(null), 2000);
    };
    
    return (
        <>
        <section id="gifts" className="min-h-screen relative overflow-hidden">
            <div className="container mx-auto px-4 py-20 relative z-10">
                {/* Cabeçalho da seção */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 mb-16"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="inline-block text-yellow-600 font-medium"
                    >
                        Contamos com você
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-serif text-gray-800"
                    >
                        Confirmar Presença
                    </motion.h2>

                    {/* Divisor decorativo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={hasAnimated ? { scale: 1 } : {}}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-4 pt-4"
                    >
                        <div className="h-[1px] w-12 bg-yellow-200" />
                        <Gift className="w-5 h-5 text-yellow-500" />
                        <div className="h-[1px] w-12 bg-yellow-200" />
                    </motion.div>

                    {/* Mensagem principal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={hasAnimated ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5 }}
                        className="space-y-4 max-w-md mx-auto"
                    >

                        <p className="text-gray-600 leading-relaxed">
                        Nossa celebração será intimista, com as pessoas que mais amamos e você é uma delas!!
</p>
<p className="text-gray-600 leading-relaxed">A sua presença é muito importante para nós, abrimos mão de presentes, porém contamos com uma “ajudinha”, para tornar tudo possível.
                        </p>

                        <div className="space-y-2">
                            <p className="leading-relaxed text-gray-800">
                                R$200,00                            </p>
                            <p className="text-gray-600 italic text-sm">
                                O valor do jantar é individual.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={hasAnimated ? { scale: 1 } : {}}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-3 pt-4"
                    >
                        <div className="h-px w-8 bg-yellow-200/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                        <div className="h-px w-8 bg-yellow-200/50" />
                    </motion.div>
                </motion.div>
                

                {/* Lista de contas bancárias */}
                <div className="max-w-2xl mx-auto grid gap-6">
                    {config.data.banks.map((account, index) => (
                        <motion.div
                            key={account.accountNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 * index + 0.7 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 to-yellow-200/50 rounded-2xl transform transition-transform group-hover:scale-105 duration-300" />
                            <div className="relative backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-yellow-100/50 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-lg bg-white p-2 shadow-sm">
                                            <Building2 className="w-full h-full text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{account.bank}</h3>
                                            <p className="text-sm text-gray-500">{account.accountName}</p>
                                        </div>
                                    </div>
                                    <Wallet className="w-5 h-5 text-yellow-500" />
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between bg-gray-50/80 px-4 py-3 rounded-lg">
                                        <p className="font-mono text-gray-700">{account.description}</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => copyToClipboard(account.accountNumber, account.bank)}
                                            className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-600"
                                        >
                                            {copiedAccount === account.bank ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                            <span className="text-sm">
                                                {copiedAccount === account.bank ? 'Copiado!' : 'Copiar'}
                                            </span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
            </div>
            
            
        </section>
        </>
    );
}