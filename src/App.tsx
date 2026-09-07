import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, ChevronRight, PhoneCall, ArrowLeft, X } from 'lucide-react';
import { cn } from './lib/utils';
import { Routes, Route, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    gtag_report_conversion: (url?: string) => boolean;
  }
}

type FormData = {
  name: string;
  phone: string;
  visit_date?: string;
  visit_time?: string;
  agreement: boolean;
};

// 폼 컴포넌트
function RegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'error'>('idle');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          visit_date: data.visit_date || '',
          visit_time: data.visit_time || '',
          agreed_to_privacy: data.agreement,
          source: 'google_ads_landing'
        })
      });

      if (!res.ok) {
        throw new Error('전송 실패');
      }

      reset();
      if (onSuccess) onSuccess();
      navigate('/complete');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-[14px] font-bold text-[#111] mb-2">이름</label>
        <input 
          type="text" 
          placeholder="성함을 입력해주세요"
          className={cn(
            "w-full px-4 py-3.5 border text-sm font-sans bg-white transition-all outline-none",
            errors.name ? "border-red-400 focus:border-red-500" : "border-[#e2e8f0] focus:border-[#0D1520]"
          )}
          {...register('name', { required: '이름을 입력해주세요.' })}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-[14px] font-bold text-[#111] mb-2">연락처</label>
        <input 
          type="tel" 
          placeholder="연락처를 입력해주세요 (예: 010-1234-5678)"
          className={cn(
            "w-full px-4 py-3.5 border text-sm font-sans bg-white transition-all outline-none",
            errors.phone ? "border-red-400 focus:border-red-500" : "border-[#e2e8f0] focus:border-[#0D1520]"
          )}
          {...register('phone', { 
            required: '연락처를 입력해주세요.',
            pattern: {
              value: /^[0-9-]{9,13}$/,
              message: '올바른 연락처 형식이 아닙니다.'
            }
          })}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[14px] font-bold text-[#111] mb-2">방문 희망 일자</label>
          <input 
            type="date" 
            className="w-full px-3 py-3 border border-[#e2e8f0] text-sm text-[#444] bg-white transition-all outline-none focus:border-[#0D1520]"
            {...register('visit_date')}
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#111] mb-2">방문 희망 시간대</label>
          <select 
            className="w-full px-3 py-3 border border-[#e2e8f0] text-sm text-[#444] bg-white transition-all outline-none focus:border-[#0D1520]"
            {...register('visit_time')}
          >
            <option value="">시간대 선택 (선택사항)</option>
            <option value="10:00 ~ 11:00">10:00 ~ 11:00</option>
            <option value="11:00 ~ 12:00">11:00 ~ 12:00</option>
            <option value="13:00 ~ 14:00">13:00 ~ 14:00</option>
            <option value="14:00 ~ 15:00">14:00 ~ 15:00</option>
            <option value="15:00 ~ 16:00">15:00 ~ 16:00</option>
            <option value="16:00 ~ 17:00">16:00 ~ 17:00</option>
            <option value="17:00 ~ 18:00">17:00 ~ 18:00</option>
          </select>
        </div>
      </div>

      <div className="border border-[#e2e8f0] p-4 bg-white mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="mt-0.5 w-4 h-4 rounded-none accent-[#0D1520] cursor-pointer"
            {...register('agreement', { required: '개인정보 수집에 동의해주세요.' })}
          />
          <div className="text-[12px] text-[#666] leading-relaxed break-keep">
            <span className="font-bold text-[#111] block mb-1">[필수] 개인정보 수집 및 이용 동의</span>
            센트레빌 아스테리움 거제 분양 정보 제공을 위해 이름, 연락처를 수집하며, 분양 종료 시 파기합니다.
          </div>
        </label>
        {errors.agreement && <p className="text-red-500 text-xs mt-2 pl-7">{errors.agreement.message}</p>}
      </div>

      {submitStatus === 'error' && (
        <p className="text-red-500 text-xs text-center py-2">
          오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#0E1726] hover:bg-[#1B2A4A] text-white text-[15px] font-bold py-4 mt-2 transition-colors tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '전송중...' : '방문예약 신청하기'}
      </button>
    </form>
  );
}

// 스크롤 페이드 애니메이션 래퍼
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white text-[var(--color-text-dark)] font-sans selection:bg-[var(--color-gold)] selection:text-white pb-24 md:pb-0">
      
      {/* NAVBAR */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 hidden md:flex items-center justify-between px-4 md:px-[60px] transition-all duration-400",
        isScrolled ? "h-[52px] md:h-[60px] bg-[rgba(13,21,32,0.96)] backdrop-blur-md border-b border-[rgba(184,151,90,0.2)]" : "h-[56px] md:h-[72px] bg-transparent"
      )}>
        <a href="#" className="font-display font-bold text-[16px] md:text-[20px] text-white tracking-widest uppercase">
          Asterium <span className="text-[var(--color-gold)]">Geoje</span>
        </a>
        <ul className="hidden md:flex gap-9">
          <li><a href="#overview" onClick={scrollTo('overview')} className="text-[14px] font-medium text-white/85 hover:text-[var(--color-gold-lt)] transition-colors tracking-wider pb-1 border-b border-transparent hover:border-[var(--color-gold-lt)]">사업개요</a></li>
          <li><a href="#premium" onClick={scrollTo('premium')} className="text-[14px] font-medium text-white/85 hover:text-[var(--color-gold-lt)] transition-colors tracking-wider pb-1 border-b border-transparent hover:border-[var(--color-gold-lt)]">프리미엄</a></li>
          <li><a href="#location" onClick={scrollTo('location')} className="text-[14px] font-medium text-white/85 hover:text-[var(--color-gold-lt)] transition-colors tracking-wider pb-1 border-b border-transparent hover:border-[var(--color-gold-lt)]">입지환경</a></li>
          <li><a href="#community" onClick={scrollTo('community')} className="text-[14px] font-medium text-white/85 hover:text-[var(--color-gold-lt)] transition-colors tracking-wider pb-1 border-b border-transparent hover:border-[var(--color-gold-lt)]">커뮤니티</a></li>
        </ul>
        <button onClick={openModal} className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-lt)] text-white px-3 md:px-[22px] py-2 md:py-[10px] text-[12px] md:text-[13px] font-bold tracking-wider transition-colors shrink-0">
          방문예약 신청
        </button>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative h-[100svh] min-h-[600px] md:min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-navy)] text-center">
        <div className="absolute inset-0 z-0">
          <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/1.jpeg" alt="히어로 배경" className="w-full h-full object-cover scale-[1.06] animate-[heroZoom_22s_ease-in-out_infinite_alternate]" />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(13,21,32,0.55)] via-[rgba(13,21,32,0.25)] to-[rgba(13,21,32,0.80)]" />
        
        <div className="relative z-20 flex flex-col items-center pt-[56px] px-6 w-full">
          <FadeIn delay={0.1}>
            <h1 className="font-serif text-[36px] md:text-[64px] font-bold text-white leading-[1.25] tracking-[-0.01em] break-keep mb-4">
              센트레빌 아스테리움 거제
            </h1>
          </FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="mb-6"
          >
            <p className="font-sans text-[20px] md:text-[36px] font-bold tracking-[0.05em] animate-text-shimmer drop-shadow-[0_0_15px_rgba(255,230,0,0.3)]">
              선착순 분양 개시
            </p>
          </motion.div>
          <FadeIn delay={0.5}>
            <p className="text-[16px] md:text-[18px] font-light text-white/75 tracking-wider mb-[44px] break-keep max-w-[320px] md:max-w-none mx-auto leading-relaxed">
              거제 최초의 하이엔드 랜드마크, 다시 없을 단 하나의 자부심으로 새로운 라이프 스타일을 완성하다
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="hidden md:flex flex-row gap-4 mb-[56px] w-full max-w-none justify-center">
            <button onClick={openModal} className="inline-flex items-center justify-center gap-2.5 bg-[var(--color-gold)] text-white py-5 px-12 text-[17px] font-bold tracking-wider shadow-[0_6px_24px_rgba(184,151,90,0.45)] hover:bg-[var(--color-gold-lt)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(184,151,90,0.55)] transition-all">
              📋 모델하우스 방문예약
            </button>
            <a href="tel:1533-5964" onClick={() => window.gtag_report_conversion('tel:1533-5964')} className="inline-flex items-center justify-center gap-2.5 bg-white/10 text-white py-5 px-12 text-[17px] font-bold tracking-wider border-2 border-white/75 backdrop-blur-md hover:bg-white/20 hover:border-white hover:-translate-y-1 transition-all">
              ☎ 분양문의 1533-5964
            </a>
          </FadeIn>

          <FadeIn delay={0.4} className="flex flex-wrap md:flex-nowrap border-t border-[rgba(184,151,90,0.35)] w-full max-w-[800px]">
            <div className="flex-1 min-w-[50%] md:min-w-0 py-6 md:py-[22px] px-2 md:px-8 border-b md:border-b-0 border-r md:border-r border-[rgba(184,151,90,0.2)] flex flex-col items-center justify-center gap-1.5">
              <span className="font-display text-[38px] md:text-[38px] font-bold text-[var(--color-gold-lt)] leading-none">1,307</span>
              <span className="text-[14px] md:text-[14px] font-normal text-white/55 tracking-wider">총 세대수</span>
            </div>
            <div className="flex-1 min-w-[50%] md:min-w-0 py-6 md:py-[22px] px-2 md:px-8 border-b md:border-b-0 md:border-r border-[rgba(184,151,90,0.2)] flex flex-col items-center justify-center gap-1.5">
              <span className="font-display text-[38px] md:text-[38px] font-bold text-[var(--color-gold-lt)] leading-none">29</span>
              <span className="text-[14px] md:text-[14px] font-normal text-white/55 tracking-wider">최고 층수</span>
            </div>
            <div className="flex-1 min-w-[50%] md:min-w-0 py-6 md:py-[22px] px-2 md:px-8 border-r md:border-r border-[rgba(184,151,90,0.2)] flex flex-col items-center justify-center gap-1.5">
              <span className="font-display text-[38px] md:text-[38px] font-bold text-[var(--color-gold-lt)] leading-none">84 / 99</span>
              <span className="text-[14px] md:text-[14px] font-normal text-white/55 tracking-wider">전용면적 (㎡)</span>
            </div>
            <div className="flex-1 min-w-[50%] md:min-w-0 py-6 md:py-[22px] px-2 md:px-8 flex flex-col items-center justify-center gap-1.5">
              <span className="font-display text-[38px] md:text-[38px] font-bold text-[var(--color-gold-lt)] leading-none">1.35</span>
              <span className="text-[14px] md:text-[14px] font-normal text-white/55 tracking-wider">세대당 주차대수</span>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 text-[10px] tracking-[0.2em] uppercase animate-bounce">
          scroll
          <div className="w-[1px] h-[40px] bg-gradient-to-b from-[rgba(184,151,90,0.6)] to-transparent" />
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="py-[72px] md:py-[120px] bg-[var(--color-cream)]">
        <div className="max-w-[1200px] mx-auto md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="px-6 md:px-0">
              <FadeIn>
                <p className="font-display text-[11px] font-normal italic tracking-[0.25em] uppercase text-[var(--color-gold)] mb-4 flex items-center gap-3 before:content-[''] before:w-[30px] before:h-[1px] before:bg-[var(--color-gold)]">
                  Project Overview
                </p>
                <h2 className="font-serif text-[30px] md:text-[40px] font-bold text-[var(--color-text-dark)] leading-[1.3] tracking-[-0.01em] break-keep mb-7">
                  거제에 없던 삶의 품격,<br/><em className="not-italic text-[var(--color-gold)]">퍼펙트한 라이프를 누리는 단 한 곳</em>
                </h2>
                <p className="text-[15px] md:text-[16px] text-[var(--color-text-mid)] leading-[1.9] break-keep mb-10 border-l-2 border-[var(--color-gold)] pl-5">
                  시간이 지날수록 빛나는 압도적 퀄리티, 거제 최초 하이엔드 브랜드. 동부건설 센트레빌 아스테리움이 새로운 주거 기준을 제시합니다.
                </p>
              </FadeIn>
              
              <FadeIn delay={0.1}>
                <table className="w-full border-collapse mt-2 text-sm border-t border-black/15">
                  <tbody>
                    <tr className="border-b border-black/5">
                      <td className="py-3.5 font-bold text-[var(--color-navy-mid)] w-[90px] md:w-[120px]">위치</td>
                      <td className="py-3.5 text-[var(--color-text-mid)] break-keep">경상남도 거제시 상동동 681번지 일원</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="py-3.5 font-bold text-[var(--color-navy-mid)]">건축규모</td>
                      <td className="py-3.5 text-[var(--color-text-mid)] break-keep">지하 3층 ~ 지상 29층, 10개동, 총 1,307세대</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="py-3.5 font-bold text-[var(--color-navy-mid)]">대지면적</td>
                      <td className="py-3.5 text-[var(--color-text-mid)]">75,629.00㎡ (약 22,877평)</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="py-3.5 font-bold text-[var(--color-navy-mid)]">세대구성</td>
                      <td className="py-3.5 text-[var(--color-text-mid)]">84A (943세대) / 84B (280세대) / 99A (84세대)</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="py-3.5 font-bold text-[var(--color-navy-mid)]">주차대수</td>
                      <td className="py-3.5 text-[var(--color-text-mid)]">1,792대 (세대당 1.35대)</td>
                    </tr>
                  </tbody>
                </table>
              </FadeIn>
            </div>
            
            <FadeIn delay={0.2} className="relative">
              <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/2.jpg" alt="조감도" className="w-full md:rounded-sm md:shadow-[20px_20px_0_rgba(184,151,90,0.15)]" />
              <div className="hidden md:block absolute -bottom-5 -left-5 bg-[var(--color-navy)] text-[var(--color-gold-lt)] py-4 px-6 font-display text-[12px] tracking-[0.12em] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                Centreville Asterium · Geoje 2026
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* PREMIUM SECTION */}
      <section id="premium" className="py-[72px] md:py-[120px] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center mb-12 md:mb-16">
            <FadeIn>
              <p className="font-display text-[11px] font-normal italic tracking-[0.25em] uppercase text-[var(--color-gold)] mb-4 flex items-center justify-center gap-3 before:content-[''] before:w-[30px] before:h-[1px] before:bg-[var(--color-gold)]">
                Premium Advantage
              </p>
              <h2 className="font-serif text-[30px] md:text-[40px] font-bold text-[var(--color-text-dark)] leading-[1.3] tracking-[-0.01em]">
                아스테리움만의 완벽한 인프라
              </h2>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-black/10">
            {/* Card 1 */}
            <FadeIn delay={0} className="group relative overflow-hidden flex flex-col border-b md:border-b-0 md:border-r border-black/10 bg-white hover:bg-[var(--color-navy)] transition-colors duration-400">
              <div className="font-display text-[64px] font-black text-black/5 leading-none pt-8 px-8 group-hover:text-[rgba(184,151,90,0.12)] transition-colors duration-400 select-none">01</div>
              <div className="px-8 pb-10 pt-3 flex-1">
                <span className="font-display text-[11px] italic tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2.5 block">Work & Education</span>
                <span className="block w-8 h-[2px] bg-[var(--color-gold)] mb-4 group-hover:w-[60px] transition-all duration-400"></span>
                <div className="font-serif text-[20px] font-bold text-[var(--color-text-dark)] leading-[1.4] break-keep mb-4 group-hover:text-white transition-colors duration-400">
                  아이를 위해 설계된<br/>원스톱 교육환경
                </div>
                <p className="text-[14px] text-[var(--color-text-mute)] leading-[1.8] break-keep group-hover:text-white/65 transition-colors duration-400">
                  초품아, 프리미엄 돌봄·교육(종로엠스쿨) 유치, 교보문고 큐레이팅. 삼성중공업·한화오션 등 양대 조선소 차량 10분 내 직주근접 최적 입지입니다.
                </p>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={0.1} className="group relative overflow-hidden flex flex-col border-b md:border-b-0 md:border-r border-black/10 bg-white hover:bg-[var(--color-navy)] transition-colors duration-400">
              <div className="font-display text-[64px] font-black text-black/5 leading-none pt-8 px-8 group-hover:text-[rgba(184,151,90,0.12)] transition-colors duration-400 select-none">02</div>
              <div className="px-8 pb-10 pt-3 flex-1">
                <span className="font-display text-[11px] italic tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2.5 block">Future Transport</span>
                <span className="block w-8 h-[2px] bg-[var(--color-gold)] mb-4 group-hover:w-[60px] transition-all duration-400"></span>
                <div className="font-serif text-[20px] font-bold text-[var(--color-text-dark)] leading-[1.4] break-keep mb-4 group-hover:text-white transition-colors duration-400">
                  총 1,307세대<br/>대단지 랜드마크
                </div>
                <p className="text-[14px] text-[var(--color-text-mute)] leading-[1.8] break-keep group-hover:text-white/65 transition-colors duration-400">
                  최고 29층, 100% 4BAY 남향위주 세대 배치. 2031년 남북내륙철도, 2035년 가덕도 신공항 등 광역 쾌속 교통망으로 미래가치가 빛납니다.
                </p>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={0.2} className="group relative overflow-hidden flex flex-col bg-white hover:bg-[var(--color-navy)] transition-colors duration-400">
              <div className="font-display text-[64px] font-black text-black/5 leading-none pt-8 px-8 group-hover:text-[rgba(184,151,90,0.12)] transition-colors duration-400 select-none">03</div>
              <div className="px-8 pb-10 pt-3 flex-1">
                <span className="font-display text-[11px] italic tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2.5 block">Premium Life</span>
                <span className="block w-8 h-[2px] bg-[var(--color-gold)] mb-4 group-hover:w-[60px] transition-all duration-400"></span>
                <div className="font-serif text-[20px] font-bold text-[var(--color-text-dark)] leading-[1.4] break-keep mb-4 group-hover:text-white transition-colors duration-400">
                  품격의 완성<br/>올인원 커뮤니티
                </div>
                <p className="text-[14px] text-[var(--color-text-mute)] leading-[1.8] break-keep group-hover:text-white/65 transition-colors duration-400">
                  실내 수영장, 스카이라운지, 올데이다이닝(조식), 단지 내 캠핑장, 펫파크, 100m 워터파크형 물놀이터 등 거제에 없던 하이라이프 프리미엄을 누리세요.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* LOCATION SECTION (50/50 Split) */}
      <section id="location" className="grid grid-cols-1 md:grid-cols-2 min-h-[640px]">
        <div className="overflow-hidden min-h-[320px] md:min-h-full h-full">
          <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/3.jpg" alt="광역위치도" className="w-full h-full object-cover" />
        </div>
        <div className="bg-[var(--color-navy)] p-[56px_32px] md:p-[80px_64px] flex flex-col justify-center">
          <FadeIn>
            <p className="font-display text-[11px] font-normal italic tracking-[0.25em] uppercase text-[var(--color-gold-lt)] mb-4 flex items-center gap-3 before:content-[''] before:w-[30px] before:h-[1px] before:bg-[var(--color-gold-lt)]">
              Location Map
            </p>
            <h2 className="font-serif text-[30px] md:text-[40px] font-bold text-white leading-[1.3] tracking-[-0.01em]">
              거제의 모든 중심을<br/>가장 빠르게 누리다
            </h2>
          </FadeIn>
          
          <ul className="mt-9 flex flex-col">
            <FadeIn delay={0.1}>
              <li className="py-[22px] border-b border-white/10 border-t flex flex-col gap-1.5">
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] italic">Traffic · Access</span>
                <span className="font-serif text-[17px] font-bold text-white">쾌속 교통 중심</span>
                <p className="text-[14px] text-white/55 leading-[1.7] break-keep mt-1">거제중앙로, 상동로, 국도우회도로, 계룡로가 교차하는 사통팔달 교통망으로 도심간 이동이 매우 수월합니다.</p>
              </li>
            </FadeIn>
            <FadeIn delay={0.2}>
              <li className="py-[22px] border-b border-white/10 flex flex-col gap-1.5">
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] italic">Nature · Environment</span>
                <span className="font-serif text-[17px] font-bold text-white">청정 자연 환경</span>
                <p className="text-[14px] text-white/55 leading-[1.7] break-keep mt-1">주변에 유해환경이 전혀 없는 청정 주거지역이며 계룡산의 쾌적한 자연을 품고 있습니다.</p>
              </li>
            </FadeIn>
            <FadeIn delay={0.3}>
              <li className="py-[22px] border-b border-white/10 flex flex-col gap-1.5">
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] italic">Future · Vision</span>
                <span className="font-serif text-[17px] font-bold text-white">빛나는 비전</span>
                <p className="text-[14px] text-white/55 leading-[1.7] break-keep mt-1">수양지구, 아주내곡지구 등 인근 지속적인 도시개발사업과 상동지구 개발의 중심에 서 있어 미래 가치가 돋보입니다.</p>
              </li>
            </FadeIn>
          </ul>
        </div>
      </section>

      {/* COMMUNITY GALLERY */}
      <section id="community" className="py-[72px] md:py-[120px] bg-[var(--color-navy-mid)]">
        <div className="max-w-[1200px] mx-auto md:px-10">
          <div className="mb-14 text-center md:text-left px-6 md:px-0">
            <FadeIn>
              <p className="font-display text-[11px] font-normal italic tracking-[0.25em] uppercase text-[var(--color-gold-lt)] mb-4 flex items-center justify-center md:justify-start gap-3 before:content-[''] before:w-[30px] before:h-[1px] before:bg-[var(--color-gold-lt)]">
                Amenities & Landscape
              </p>
              <h2 className="font-serif text-[30px] md:text-[40px] font-bold text-white leading-[1.3] tracking-[-0.01em]">
                상위 1%를 위한<br/>압도적 커뮤니티 특화시설
              </h2>
              <p className="text-[15px] md:text-[16px] text-white/50 mt-4 break-keep">
                거제 지역의 일반 아파트에서는 볼 수 없었던 수영장, 스카이라운지, 게스트하우스 등 차원이 다른 하이엔드 라이프가 펼쳐집니다.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px]">
            {/* Gallery Item 1 (Wide on desktop) */}
            <FadeIn delay={0.1} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] md:col-span-2 group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/4.jpg" alt="수영장" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Aqua Vista</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">센트웰 아쿠아 비스타 (수영장)</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">단지 내 25m 3레인의 실내수영장 및 유아풀 조성</p>
              </div>
            </FadeIn>

            {/* Gallery Item 2 */}
            <FadeIn delay={0.2} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/5.jpg" alt="라운지" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Sky Lounge</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">최상층 스카이 라운지</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">파노라마 조망 전용 엘리베이터 완비 고급 라운지</p>
              </div>
            </FadeIn>

            {/* Gallery Item 3 */}
            <FadeIn delay={0.3} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/6.jpg" alt="티하우스" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Tea House</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">센트레 티하우스</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">실내 정원과 폭포수 경관을 바라보며 즐기는 웰빙 스페이스</p>
              </div>
            </FadeIn>

            {/* Gallery Item 4 */}
            <FadeIn delay={0.4} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/7.jpg" alt="가든스위트" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Garden Suite</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">센트웰 가든스위트</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">품격 높은 숙박 및 파티가 가능한 프라이빗 공간 (31·38평형)</p>
              </div>
            </FadeIn>

            {/* Gallery Item 5 */}
            <FadeIn delay={0.5} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/8.jpg" alt="그랜드 그린" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Grand Green</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">그랜드 그린 3600</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">단지 중앙에 펼쳐지는 거대한 잔디광장과 특화 조경 공간</p>
              </div>
            </FadeIn>

            {/* Gallery Item 6 */}
            <FadeIn delay={0.6} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[340px] group cursor-default bg-[var(--color-navy)] md:bg-transparent">
              <div className="h-[260px] md:h-full w-full overflow-hidden">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/9.jpg" alt="그랜드 플레이" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
              </div>
              <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.1)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Grand Play</span>
                <h3 className="font-serif text-[18px] font-bold text-white leading-[1.35] mb-1.5">그랜드 플레이 120</h3>
                <p className="text-[13px] text-white/60 leading-[1.55] break-keep">아이들의 창의력을 키워주는 대규모 어드벤처 특화 놀이공간</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* LANDSCAPE SECTION */}
      <section className="py-[120px] md:py-[180px] bg-[#f9f9f9]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="text-center mb-16 md:mb-[100px] px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[var(--color-gold)] opacity-50" />
              <span className="font-display text-[11px] tracking-[0.3em] uppercase italic text-[var(--color-gold)]">
                Landscape Special
              </span>
              <div className="w-8 h-[1px] bg-[var(--color-gold)] opacity-50" />
            </div>
            <h2 className="font-serif text-[32px] md:text-[44px] font-bold text-[#111] leading-[1.3] mb-5 break-keep">
              자연이 살아 숨쉬는<br />특화 조경 공간
            </h2>
            <p className="text-[15px] md:text-[17px] text-[#555] leading-[1.6] max-w-[600px] mx-auto break-keep font-light">
              단지 곳곳에 펼쳐지는 압도적 조경 특화시설로<br className="hidden md:block" />일상이 힐링이 되는 프리미엄 주거환경을 경험하세요.
            </p>
          </FadeIn>

          <div className="flex flex-col gap-[3px] md:gap-[40px] md:px-6">
            {/* Waterfall Garden - Image Left/Top, Text Right/Bottom */}
            <FadeIn className="flex flex-col md:flex-row bg-white md:border border-[#eaeaea]">
              <div className="w-full md:w-[60%] h-[300px] md:h-[500px]">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/10.jpg" alt="워터풀 가든" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[40%] p-10 px-6 md:p-[80px] flex flex-col justify-center">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-3 block">Waterfall Garden</span>
                <h3 className="font-serif text-[26px] md:text-[32px] font-bold text-[#111] leading-[1.3] mb-5">
                  워터풀 가든<br />— 도심 속 폭포 정원
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#666] leading-[1.7] break-keep font-light mb-10">
                  단지 중앙에 펼쳐지는 거대한 암반 폭포와 수경 조경이 어우러진 특화 공간입니다. Vista Lounge에서 폭포를 내려다보는 감동적인 조망과 함께 일상의 쉼표를 선사합니다.
                </p>
                <div className="inline-block border border-[#ddd] px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-display italic text-[#888] self-start">
                  Vista Lounge
                </div>
              </div>
            </FadeIn>

            {/* Kids Village - Text Left/Top, Image Right/Bottom */}
            <FadeIn className="flex flex-col-reverse md:flex-row bg-[#111] text-white">
              <div className="w-full md:w-[40%] p-10 px-6 md:p-[80px] flex flex-col justify-center">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-3 block">Kids Village</span>
                <h3 className="font-serif text-[26px] md:text-[32px] font-bold text-white leading-[1.3] mb-5">
                  아스테리움<br />키즈빌리지
                </h3>
                <p className="text-[14px] md:text-[15px] text-white/70 leading-[1.7] break-keep font-light mb-10">
                  아이들의 창의력과 감수성을 키워주는 독립 건물 형태의 Kids Village. 실내 놀이 공간과 야외 어드벤처 플레이그라운드가 결합된 대규모 어린이 전용 복합 특화 시설입니다.
                </p>
                <div className="inline-block border border-white/20 px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-display italic text-white/50 self-start">
                  Kids Village
                </div>
              </div>
              <div className="w-full md:w-[60%] h-[300px] md:h-[500px]">
                <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/11.jpg" alt="키즈빌리지" className="w-full h-full object-cover" />
              </div>
            </FadeIn>

            {/* 3 Column Grid for other features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px] md:gap-5">
              <FadeIn delay={0.1} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[400px] group cursor-default bg-white md:bg-transparent border-x border-b md:border-0 border-[#eaeaea]">
                <div className="h-[260px] md:h-full w-full overflow-hidden">
                  <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/12.jpg" alt="게이트" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
                </div>
                <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.2)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                  <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Honors Luminous Gate</span>
                  <h3 className="font-serif text-[18px] font-bold text-[#111] md:text-white leading-[1.35] mb-2">아너스 루미너스 게이트</h3>
                  <p className="text-[13px] text-[#555] md:text-white/70 leading-[1.55] break-keep font-light">단지의 첫 인상을 완성하는 품격 높은 하이엔드 문주</p>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[400px] group cursor-default bg-white md:bg-transparent border-x border-b md:border-0 border-[#eaeaea]">
                <div className="h-[260px] md:h-full w-full overflow-hidden">
                  <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/13.jpg" alt="전망대" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
                </div>
                <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.2)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                  <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Gyeryongsan Observatory</span>
                  <h3 className="font-serif text-[18px] font-bold text-[#111] md:text-white leading-[1.35] mb-2">아스테리움 계룡산전망대</h3>
                  <p className="text-[13px] text-[#555] md:text-white/70 leading-[1.55] break-keep font-light">계룡산 자연과 거제 시내 파노라마를 품은 특화 전망 공간</p>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3} className="relative flex flex-col md:block overflow-hidden h-auto md:h-[400px] group cursor-default bg-white md:bg-transparent border-x border-b md:border-0 border-[#eaeaea]">
                <div className="h-[260px] md:h-full w-full overflow-hidden">
                  <img src="https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/14.jpg" alt="펫프렌즈" className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]" />
                </div>
                <div className="p-6 md:absolute md:inset-0 md:bg-gradient-to-t md:from-[rgba(13,21,32,0.85)] md:via-[rgba(13,21,32,0.2)] md:to-transparent flex flex-col justify-end md:p-7 pointer-events-none md:group-hover:from-[rgba(13,21,32,0.95)] transition-colors">
                  <span className="font-display text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-gold)] mb-1">Camp Pet-Friends</span>
                  <h3 className="font-serif text-[18px] font-bold text-[#111] md:text-white leading-[1.35] mb-2">캠프 펫프렌즈</h3>
                  <p className="text-[13px] text-[#555] md:text-white/70 leading-[1.55] break-keep font-light">반려동물과 함께하는 프라이빗 캠핑 & 펫 특화 커뮤니티 공간</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-[130px] text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://pub-e2bb23fc59ee44128f4e67a585100d97.r2.dev/%EB%8F%99%EB%B6%802/1.jpeg')] bg-cover bg-center bg-fixed z-0" />
        <div className="absolute inset-0 bg-[rgba(13,21,32,0.88)] z-0" />
        <div className="relative z-10 px-6">
          <FadeIn>
            <span className="font-display text-[12px] tracking-[0.3em] uppercase italic text-[var(--color-gold)] block mb-4">
              R E G I S T R A T I O N
            </span>
            <h2 className="font-serif text-[36px] md:text-[46px] font-bold text-white leading-[1.3] mb-3 break-keep">
              모델하우스 방문 예약
            </h2>
            <p className="text-[16px] text-white/80 mb-11 break-keep">
              지금 바로 모델하우스 방문예약을 하시고 특별한 혜택을 받으세요
            </p>
            <div className="max-w-[480px] mx-auto bg-white p-7 md:p-9 text-left border-t-[3px] border-[var(--color-gold)] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <RegistrationForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--color-navy)] text-white/35 py-14 px-6 md:px-10 text-[13px] leading-[1.9]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="font-display text-[18px] tracking-[0.1em] text-white/70 flex items-center gap-3.5 mb-5 after:content-[''] after:w-[40px] after:h-[1px] after:bg-[var(--color-gold)]">
              CENTREVILLE ASTERIUM
            </div>
            <p>광고 대행사 : 지존애드(주) <span className="px-1.5">|</span> 대표자 : 이정준</p>
            <p>정보관리책임자 : 송영식 <span className="px-1.5">|</span> 대표번호 : 1533-5964 <span className="px-1.5">|</span> 사업자번호 : 178-81-02936</p>
            <p className="text-[12px] mt-4 text-white/20">※ 본 사이트의 이미지, 디자인, 문구 등은 소비자의 이해를 돕기 위해 제작된 것으로 실제와 다를 수 있습니다.</p>
          </div>
          <div className="text-left md:text-right text-[12px]">
            <p>© 2024 Centreville Asterium Geoje. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM FLOATING BAR */}
      <div className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 flex shadow-[0_-4px_24px_rgba(0,0,0,0.35)] transition-transform duration-500",
        isScrolled ? "translate-y-0" : "translate-y-full"
      )}>
        <button onClick={openModal} className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-gold)] text-white py-[16px] px-3 transition-colors active:bg-[var(--color-gold-lt)]">
          <div className="flex flex-col text-left leading-[1.2]">
            <span className="text-[10px] opacity-75 tracking-wider font-light">방문예약 혜택</span>
            <span className="text-[14px] font-extrabold tracking-wide">방문예약 신청</span>
          </div>
        </button>
        <a href="tel:1533-5964" onClick={() => window.gtag_report_conversion('tel:1533-5964')} className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-navy)] text-white py-[16px] px-3 transition-colors active:bg-[var(--color-navy-mid)]">
          <PhoneCall size={18} />
          <div className="flex flex-col text-left leading-[1.2]">
            <span className="text-[10px] opacity-75 tracking-wider font-light">빠른 상담 문의</span>
            <span className="text-[14px] font-extrabold tracking-wide">1533-5964</span>
          </div>
        </a>
      </div>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="relative w-full max-w-[520px] bg-white border-t-[3px] border-[var(--color-gold)] p-8 md:p-12 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={closeModal} className="absolute top-5 right-5 text-[var(--color-text-mute)] hover:text-black transition-colors">
                <X size={24} />
              </button>
              
              <div className="mb-6">
                <span className="font-display text-[10px] tracking-[0.3em] uppercase italic text-[var(--color-gold)] block mb-2">
                  R E G I S T R A T I O N
                </span>
                <h3 className="font-serif text-[26px] font-bold text-[var(--color-navy)] mb-1.5">모델하우스 방문 예약</h3>
                <p className="text-[13px] text-[var(--color-text-mute)]">지금 바로 모델하우스 방문예약을 하시고 특별한 혜택을 받으세요</p>
              </div>

              <RegistrationForm onSuccess={closeModal} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

      // Google Ads Conversion Tag
      if (typeof w.gtag === 'function') {
        w.gtag('event', 'conversion', {'send_to': 'AW-17817290005/s__3CI3zub8cEJWK-a9C'});
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex flex-col items-center justify-center p-6 text-center text-white selection:bg-[var(--color-gold)] selection:text-white">
      <div className="w-full max-w-md bg-white p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-t-[3px] border-[var(--color-gold)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[var(--color-navy)] text-[var(--color-gold-lt)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-[26px] font-bold text-[var(--color-navy)] mb-4 font-serif">상담 신청이 완료되었습니다!</h2>
          <p className="text-[#666] text-[15px] mb-8 leading-[1.8] break-keep">
            센트레빌 아스테리움 거제의<br/>최신 소식과 특별 혜택을<br/>가장 먼저 안내해 드리겠습니다.
          </p>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-navy)] hover:bg-[var(--color-gold)] text-white font-bold text-[15px] py-4 transition-colors tracking-widest"
          >
            <ArrowLeft size={18} />
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
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


