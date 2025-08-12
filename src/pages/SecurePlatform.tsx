import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, Fingerprint, Eye, EyeOff } from 'lucide-react';

const SecurePlatform = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add security-related meta tags
    document.title = 'Secure Platform | Justice AI Oracle';
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Security Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-judicial-gold" />
            <span className="text-xl font-bold text-foreground">Secure Platform</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-judicial-gold hover:bg-judicial-gold/10"
          >
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-judicial-gold to-judicial-lightGold bg-clip-text text-transparent">
              Secure Legal Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your confidential legal matters are protected with enterprise-grade security and encryption.
            </p>
          </section>

          {/* Security Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors">
              <Lock className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-muted-foreground">
                All communications and documents are encrypted using industry-standard protocols.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors">
              <Fingerprint className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Factor Authentication</h3>
              <p className="text-muted-foreground">
                Enhanced security with multiple verification methods for account access.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors">
              <Key className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Document Storage</h3>
              <p className="text-muted-foreground">
                Your legal documents are stored securely with regular backups and version control.
              </p>
            </div>
          </section>

          {/* Access Control Section */}
          <section className="bg-background/50 border border-border rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6">Access Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Role-Based Permissions</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-judicial-gold" />
                    View-only access for clients
                  </li>
                  <li className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-judicial-gold" />
                    Restricted document visibility
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Activity Monitoring</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-judicial-gold" />
                    Real-time access logs
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-judicial-gold" />
                    Suspicious activity alerts
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Button
              size="lg"
              className="bg-judicial-gold text-judicial-dark hover:bg-judicial-gold/90"
              onClick={() => navigate('/auth')}
            >
              Access Secure Platform
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Justice AI Oracle. All rights reserved.</p>
          <p className="text-sm mt-2">This platform is protected by advanced security measures.</p>
        </div>
      </footer>
    </div>
  );
};

export default SecurePlatform; 