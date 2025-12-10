import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, FileClock, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScanCard } from '@/components/ScanCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { ScanRecord } from '@shared/types';
export function ScanPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const fetchScans = async (newCursor: string | null = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = newCursor ? `/api/scans?cursor=${newCursor}` : '/api/scans';
      const result = await api<{ items: ScanRecord[]; next: string | null }>(url);
      setScans(prev => newCursor ? [...prev, ...result.items] : result.items);
      setCursor(result.next);
      setHasNextPage(!!result.next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scans';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchScans();
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl md:text-5xl font-display font-bold">Scan History</h1>
                <Button asChild variant="outline">
                  <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload</Link>
                </Button>
              </div>
            </header>
            <main>
              {error && (
                <div className="text-center py-10 text-destructive bg-destructive/10 rounded-lg">
                  <p>Error: {error}</p>
                  <Button onClick={() => fetchScans()} className="mt-4">Try Again</Button>
                </div>
              )}
              {!error && (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {scans.map(scan => (
                      <motion.div key={scan.id} variants={itemVariants}>
                        <ScanCard scan={scan} />
                      </motion.div>
                    ))}
                    {isLoading && Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </motion.div>
                  {!isLoading && scans.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                      <FileClock className="mx-auto h-16 w-16 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">No Scans Found</h2>
                      <p>You haven't submitted any files for scanning yet.</p>
                    </div>
                  )}
                  {hasNextPage && !isLoading && (
                    <div className="text-center mt-8">
                      <Button onClick={() => fetchScans(cursor)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </>
  );
}