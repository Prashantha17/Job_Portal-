import React from 'react';
import { Building2, CheckCircle2, Users, Star, ArrowUpRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const CompanySection: React.FC = () => {
  const companies = [
    {
      name: 'CloudScale Dynamics',
      industry: 'Cloud Infrastructure & SaaS',
      openings: 24,
      rating: 4.9,
      employees: '2,500+',
      verified: true,
      tagline: 'Leading multi-cloud container orchestration and microservice observability.'
    },
    {
      name: 'FinTech Nexus Corp',
      industry: 'Financial Technology',
      openings: 18,
      rating: 4.8,
      employees: '5,000+',
      verified: true,
      tagline: 'High-throughput algorithmic transaction processing and payment gateways.'
    },
    {
      name: 'Vanguard Health Tech',
      industry: 'Digital Health & Biotech',
      openings: 15,
      rating: 4.7,
      employees: '1,200+',
      verified: true,
      tagline: 'Transforming healthcare diagnostics with AI-assisted patient care portals.'
    },
    {
      name: 'Aether Cloud Systems',
      industry: 'Enterprise Security & AI',
      openings: 31,
      rating: 4.9,
      employees: '800+',
      verified: true,
      tagline: 'Zero-trust enterprise identity and autonomous security compliance engines.'
    }
  ];

  return (
    <section id="companies" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="primary" size="sm">
            <Building2 className="w-3.5 h-3.5 text-brand-600" /> Enterprise Partners
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by World-Class Engineering Teams
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Over 840+ forward-thinking enterprises use TalentFlow 360 to source, screen, and onboard high-caliber tech talent.
          </p>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((company) => (
            <div
              key={company.name}
              className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 p-6 shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-brand-700 text-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {company.rating}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                    {company.name}
                  </h3>
                  {company.verified && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </div>

                <span className="text-xs font-medium text-slate-500 block mb-3">
                  {company.industry}
                </span>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {company.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {company.employees}
                </span>
                <span className="font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1">
                  {company.openings} open roles
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Logo Band */}
        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-wrap items-center justify-around gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
          <div className="font-bold text-lg text-slate-700 tracking-wider">▲ CLOUDSCALE</div>
          <div className="font-extrabold text-lg text-slate-700 tracking-tight">● FINTECH NEXUS</div>
          <div className="font-semibold text-lg text-slate-700 tracking-widest">■ VANGUARD HEALTH</div>
          <div className="font-black text-lg text-slate-700">✦ AETHER CLOUD</div>
          <div className="font-bold text-lg text-slate-700 tracking-wider">◆ TALENTCOGNITION</div>
        </div>
      </div>
    </section>
  );
};

