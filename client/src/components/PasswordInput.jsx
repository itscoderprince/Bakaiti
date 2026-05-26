import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const PasswordInput = forwardRef(({
  value,
  onChange,
  name,
  id,
  placeholder = "Password",
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-10 ${className || ''}`}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center cursor-pointer"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
