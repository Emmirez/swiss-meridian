import { Link } from "react-router-dom";
import { Clock3, ShieldCheck } from "lucide-react";

const RegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto mb-5">
          <Clock3 size={28} />
        </div>
        <h1 className="text-xl font-bold text-navy-900">Your application is under review</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          Thanks for verifying your email. Our team reviews every new
          account application before it goes live — you'll get an email and in-app
          notification the moment your account is approved.
        </p>
        <div className="flex items-center gap-2 justify-center mt-6 text-xs text-slate-400">
          <ShieldCheck size={14} /> Manual review keeps every account secure
        </div>
        <Link to="/login" className="btn-primary w-full mt-8 inline-block">Go to Login</Link>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
