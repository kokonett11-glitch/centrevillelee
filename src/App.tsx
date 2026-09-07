import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { CheckCircle2, ChevronRight, PhoneCall, AlertCircle, Edit, ArrowLeft } from 'lucide-react';
import { cn } from './lib/utils';
import { Routes, Route, useNavigate } from 'react-router-dom';

type FormData = {
  name: string;
  phone: string;
  agreement: boolean;
};

// 폼 컴포넌트 분리
function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'error'>('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitErrorMessage('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          agreement: data.agreement,
          source: 'google_ads_landing'
        })
      });

      if (!res.ok) {
        throw new Error('전송 중 오류가 발생했습니다.');
      }

      reset();
      navigate('/complete');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitErrorMessage(error.message || JSON.stringify(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl relative text-gray-900 border-4 border-brand-gold/30">
      <AnimatePresence mode="wait">
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
        >
            <div>
              <input 
                type="text" 
                placeholder="이름 (성함)"
                className={cn(
                  "w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 outline-none transition-all placeholder:text-gray-400 focus:bg-white text-base",
                  errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-brand-gold"
                )}
                {...register('name', { required: '이름을 입력해주세요.' })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 px-1">{errors.name.message}</p>}
            </div>

            <div>
              <input 
                type="tel" 
                placeholder="연락처 (010-0000-0000)"
                className={cn(
                  "w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 outline-none transition-all placeholder:text-gray-400 focus:bg-white text-base",
                  errors.phone ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-brand-gold"
                )}
                {...register('phone', { 
                  required: '연락처를 입력해주세요.',
                  pattern: {
                    value: /^[0-9-]{9,13}$/,
                    message: '올바른 연락처 형식이 아닙니다.'
                  }
                })}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 px-1">{errors.phone.message}</p>}
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer w-5 h-5 appearance-none rounded border-2 border-gray-300 bg-white checked:bg-[#0F281A] checked:border-[#0F281A] transition-colors"
                    {...register('agreement', { required: '개인정보 이용 동의가 필요합니다.' })}
                  />
                  <CheckCircle2 size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <div className="text-[11px] text-gray-500 leading-tight">
                  <span className="font-bold text-gray-700 block mb-1">[필수] 개인정보 수집 및 이용 동의</span>
                  수집목적: 관심고객 안내 및 분양정보 제공<br/>
                  수집항목: 이름, 연락처<br/>
                  보유기간: 분양 종료 시 또는 동의 철회 시까지
                </div>
              </label>
              {errors.agreement && <p className="text-red-500 text-xs mt-1.5 px-1">{errors.agreement.message}</p>}
            </div>

            {submitStatus === 'error' && (
              <p className="text-red-500 text-xs text-center p-2 bg-red-50 rounded">
                오류가 발생했습니다. 잠시 후 다시 시도해주세요. {submitErrorMessage && `(${submitErrorMessage})`}
              </p>
            )}

            <div className="pt-3 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0F281A] text-brand-gold font-bold text-lg py-4 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? '처리중...' : '관심고객 등록하기'}
                {!isSubmitting && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /> }
              </button>
              
              <div className="text-center pt-2 pb-1 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">빠른 상담이 필요하시다면?</p>
                <a 
                  href="tel:1533-5964"
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 text-[#0F281A] border-2 border-[#0F281A]/10 hover:border-brand-gold hover:bg-white font-extrabold text-base py-3 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  <PhoneCall size={18} className="text-brand-gold" />
                  <span>빠른 상담 <span className="text-lg ml-0.5 tracking-tight">1533-5964</span></span>
                </a>
              </div>
            </div>
          </motion.form>
      </AnimatePresence>
    </div>
  );
}

function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
    if (!isFormOpen) {
      setTimeout(() => {
        document.getElementById('hero-register-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const scrollToFooterForm = () => {
    document.getElementById('footer-register-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // High quality Unsplash images of professional women to act as "hosts"
  const hostImages = {
    hero: "https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/1.jpeg", // Smiling welcoming
    feat1: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000&auto=format&fit=crop", // Standing confident
    feat2: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop", // Warm smile
    feat3: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"  // Professional looking
  };

  return (
    <div className="min-h-screen bg-[#0F281A] text-white font-sans selection:bg-brand-gold selection:text-[#0F281A]">
      
      {/* Main Container - Mobile Optimized Width like a poster */}
      <main className="max-w-md mx-auto min-h-screen bg-[#0F281A] shadow-2xl overflow-hidden pb-24 relative">
        
        {/* Background Texture/Accents */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-screen filter blur-[100px]" />
        </div>
        
        {/* HERO SECTION */}
        <section className="relative pt-12 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-6 w-full text-center"
          >
            <h1 className="text-brand-gold text-[2rem] sm:text-[2.5rem] font-serif font-bold mb-4 tracking-tighter drop-shadow-md leading-tight text-center break-keep">
              센트레빌 아스테리움 거제
            </h1>
            <div className="inline-flex flex-col items-center justify-center mt-3">
              <span className="text-gray-100 font-black text-2xl sm:text-3xl leading-snug tracking-tight drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] italic text-center">
                2026년 6월중<br/>
                <span className="text-yellow-300 text-[2rem] sm:text-[2.2rem] mt-1 block">드디어 공개!</span>
              </span>
            </div>
          </motion.div>

          <div className="relative w-full aspect-[4/5] mt-2">
            {/* 오버레이를 하단에만 적용하여 상단 조감도/배경이 선명하게 보이도록 수정 */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0F281A] via-[#0F281A]/80 to-transparent z-10 pointer-events-none" />
            <img 
              src={hostImages.hero} 
              alt="히어로 배경" 
              className="w-full h-full object-cover object-top"
              style={{ WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
            />
            <p className="absolute bottom-1 right-2 text-[10px] text-gray-400 z-20">* 상기 조감도 이미지는 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.</p>
            <div className="absolute bottom-10 left-0 right-0 z-20 px-2 text-center flex flex-col items-center">
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-white text-[13px] sm:text-sm font-bold tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap mb-4"
              >
                관심고객 한정 <span className="text-brand-gold">특별혜택</span> 및 분양 일정 <span className="text-brand-gold">우선 안내</span>
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }} 
                animate={
                  isFormOpen 
                  ? { opacity: 1, y: 0, scale: 1, boxShadow: "0px 0px 20px rgba(198,168,124,0.4)" }
                  : { opacity: 1, y: 0, scale: [1, 1.05, 1], boxShadow: ["0px 0px 15px rgba(198,168,124,0.4)", "0px 0px 35px rgba(198,168,124,0.9)", "0px 0px 15px rgba(198,168,124,0.4)"] }
                } 
                transition={{ 
                  opacity: { delay: 0.7, duration: 0.3 },
                  y: { delay: 0.7, duration: 0.3 },
                  scale: { duration: 1.5, repeat: isFormOpen ? 0 : Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 1.5, repeat: isFormOpen ? 0 : Infinity, ease: "easeInOut" }
                }}
                onClick={toggleForm}
                className="bg-brand-gold text-[#0F281A] px-6 py-2.5 rounded-full font-extrabold text-[15px] transition-colors active:scale-95"
              >
                {isFormOpen ? '단축하기' : '관심고객 등록하기'}
              </motion.button>
            </div>
          </div>
          
          {/* TOOGLED FORM SECTION */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden w-full relative z-20 bg-[#0F281A]"
              >
                <div id="hero-register-form" className="py-8 px-6 border-b border-brand-gold/20">
                  <RegistrationForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* HOST GESTURE IMAGE SECTION */}
        <section className="w-full relative border-t border-brand-gold/20">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/2.jpeg"
            alt="안내 호스트 상세"
            className="w-full h-auto block"
          />
        </section>

        {/* OVERVIEW SECTION */}
        <section className="w-full relative border-t border-brand-gold/20">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/3.jpeg"
            alt="사업개요"
            className="w-full h-auto block"
          />
        </section>

        {/* PREMIUM LOUNGE SECTION */}
        <section className="w-full relative border-t border-brand-gold/20 bg-[#0A1A11]">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/4.jpeg"
            alt="프리미엄 라운지 인테리어"
            className="w-full h-auto block"
          />
        </section>

        {/* COMMUNITY SECTION */}
        <section className="w-full relative border-t border-brand-gold/20 bg-[#0A1A11]">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/5.jpeg"
            alt="특화 커뮤니티 시설"
            className="w-full h-auto block"
          />
        </section>

        {/* ADDITIONAL IMAGE SECTION */}
        <section className="w-full relative border-t border-brand-gold/20 bg-[#0A1A11]">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/6.jpeg"
            alt="추가 안내 모델"
            className="w-full h-auto block"
          />
        </section>

        {/* ARCHITECTURAL DESIGN SECTION */}
        <section className="w-full relative border-t border-brand-gold/20 bg-[#0A1A11]">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/7.jpeg"
            alt="프리미엄 모던 건축 디자인"
            className="w-full h-auto block"
          />
        </section>

        {/* CTA IMAGE SECTION */}
        <section className="w-full relative border-t border-brand-gold/20 bg-[#0A1A11]">
          <img 
            src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/8.jpeg"
            alt="관심고객 등록 안내"
            className="w-full h-auto block"
          />
        </section>

        {/* BOTTOM FORM SECTION */}
        <section id="footer-register-form" className="relative z-20 py-12 px-6 bg-[#0F281A] border-t-2 border-brand-gold">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-brand-gold mb-2">관심고객 등록</h2>
            <p className="text-sm text-gray-300">
              정보를 남겨주시면 특별 혜택을<br/>가장 먼저 안내해 드립니다.
            </p>
          </div>
          <RegistrationForm />
        </section>

        {/* FOOTER */}
        <footer className="bg-[#0A1A11] text-gray-400 py-10 px-6 text-[10px] text-center flex flex-col gap-1">
          <p className="mb-2 font-bold text-brand-gold/60">센트레빌 아스테리움 거제</p>
          <div className="mb-3 text-gray-500 leading-loose flex flex-col gap-1">
            <p>광고 대행사 : 지존애드(주) <span className="px-2">|</span> 대표자 : 이정준</p>
            <p>정보관리책임자 : 이대진 <span className="px-2">|</span> 대표번호 : <a href="tel:1533-5964" className="hover:text-brand-gold">1533-5964</a> <span className="px-2">|</span> 사업자번호 : 178-81-02936</p>
          </div>
          <p className="mb-4 text-gray-600">본 사이트의 이미지, 디자인, 문구 등은 소비자의 이해를 돕기 위해 제작된 것으로 실제와 다를 수 있습니다.</p>
          <p>© 2024 Centreville Asterium. All rights reserved.</p>
        </footer>
      </main>

      {/* Floating Action Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#0F281A]/95 backdrop-blur-lg border-t border-brand-gold/20 z-40 md:hidden pb-safe">
        <div className="max-w-md mx-auto flex gap-3">
          <a 
            href="tel:1533-5964"
            className="flex-1 bg-white/10 border border-brand-gold/30 text-brand-gold font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <PhoneCall size={18} />
            1533-5964
          </a>
          <button 
            onClick={scrollToFooterForm}
            className="flex-1 bg-brand-gold text-[#0F281A] font-extrabold text-base py-3.5 rounded-xl shadow-[0_4px_14px_rgba(198,168,124,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Edit size={18} />
            관심고객 등록
          </button>
        </div>
      </div>

    </div>
  );
}

function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    // 문의완료 페이지 렌더링 시 GTM 이벤트 1회 발송
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        'event': 'inquiry_complete'
      });
      console.log('GTM Tag Fired: inquiry_complete on /complete');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F281A] flex flex-col items-center justify-center p-6 text-center text-white selection:bg-brand-gold selection:text-[#0F281A]">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border-4 border-brand-gold/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-[#0F281A]/10 text-[#0F281A] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#0F281A]/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#0F281A] mb-4 font-serif">상담 신청이 완료되었습니다!</h2>
          <p className="text-gray-600 text-base mb-8 leading-relaxed">
            센트레빌 아스테리움 거제의<br/>최신 소식과 특별 혜택을<br/>가장 먼저 안내해 드리겠습니다.
          </p>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="w-full max-w-[200px] flex items-center justify-center gap-2 bg-[#0F281A] text-brand-gold font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_rgba(15,40,26,0.3)] active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-gray-400 text-[11px] text-center max-w-sm">
        <p className="mb-2 font-bold text-brand-gold/60">센트레빌 아스테리움 거제</p>
        <div className="mb-4 text-gray-500 leading-loose text-[10px] flex flex-col gap-1">
          <p>광고 대행사 : 지존애드(주) <span className="px-1.5">|</span> 대표자 : 이정준</p>
          <p>정보관리책임자 : 이대진 <span className="px-1.5">|</span> 대표번호 : <a href="tel:1533-5964" className="hover:text-brand-gold">1533-5964</a> <span className="px-1.5">|</span> 사업자번호 : 178-81-02936</p>
        </div>
        <p>© 2024 Centreville Asterium. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/complete" element={<Complete />} />
    </Routes>
  );
}

