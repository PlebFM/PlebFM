import AuthContext from "./AuthContext";

export interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function QueueLayout({ children }: AccountLayoutProps) {
  return (
    <AuthContext>
      {children}
    </AuthContext>
  );
}