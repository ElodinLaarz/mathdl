'use client';

import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HintDisplayProps {
  onRequestHint: () => void;
  hintUsed: boolean;
  revealedHint: string | null;
  disabled?: boolean;
}

export default function HintDisplay({
  onRequestHint,
  hintUsed,
  revealedHint,
  disabled,
}: HintDisplayProps) {
  return (
    <div className="my-6">
      {!hintUsed && (
        <Button
          onClick={onRequestHint}
          disabled={disabled || hintUsed}
          variant="outline"
          className="w-full border-accent text-accent-foreground hover:bg-accent/10"
        >
          <Lightbulb size={18} className="mr-2" />
          Get a Hint
        </Button>
      )}

      {hintUsed && revealedHint && (
        <Card className="mt-4 bg-accent/10 border-accent/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center font-headline">
              <Lightbulb size={20} className="mr-2 text-accent-foreground" /> Hint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent-foreground/90">{revealedHint}</p>
          </CardContent>
        </Card>
      )}
      {hintUsed &&
        !revealedHint && ( // Should not happen if logic is correct, but as a fallback
          <Card className="mt-4 bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lightbulb size={20} className="mr-2 text-muted-foreground" /> Hint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Hint has been used.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
