'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateLearningPath,
  generateWeeklyGoals,
  generateMonthlyGoals,
  generateYearlyGoals,
} from '@/lib/mistral-ai';
import {
  saveLearningPath,
  saveWeeklyGoals,
  saveMonthlyGoals,
  saveYearlyGoals,
  updateUserCreditsInIndexedDB,  // Updated import
  getUserCredits,       // Function to update credits in IndexedDB
} from '@/lib/indexeddb';
import { Download, Sparkles } from 'lucide-react';
import { useGenerations } from '@/lib/generations';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function Dashboard() {
  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [contentType, setContentType] = useState('weeklyGoals');
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { generationsLeft, useGeneration, addGenerations } = useGenerations(); // Added setGenerationsLeft
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

   useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const purchasedCredits = urlParams.get('limit');

    if (success === 'true' && purchasedCredits) {
      // Update user's credits in IndexedDB
      const creditsToAdd = parseInt(purchasedCredits, 10);
      
      updateUserCreditsInIndexedDB(creditsToAdd).then(() => {
  // Update the state with the new number of generations
  addGenerations(generationsLeft + creditsToAdd); // Add creditsToAdd to the current generationsLeft

  toast({
    title: 'Credits Added',
    description: `You have successfully purchased ${creditsToAdd} generations.`,
  });
}).catch((error) => {
  console.error('Failed to update credits in IndexedDB:', error);
  toast({
    title: 'Error',
    description: 'Failed to update your credits. Please contact support.',
    variant: 'destructive',
  });
});
    }
  }, [addGenerations, toast]);

  const handleGenerate = async () => {
    if (!skill || !experience) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both skill and experience level.',
        variant: 'destructive',
      });
      return;
    }

    if (!useGeneration()) {
      toast({
        title: 'Daily Limit Reached',
        description:
          "You've reached your daily limit. Get more generations or wait for tomorrow.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let content: string;
      switch (contentType) {
        case 'learningPath':
          content = await generateLearningPath(skill, experience);
          await saveLearningPath(skill, content);
          break;
        case 'weeklyGoals':
          content = await generateWeeklyGoals(skill, experience);
          await saveWeeklyGoals(skill, content);
          break;
        case 'monthlyGoals':
          content = await generateMonthlyGoals(skill, experience);
          await saveMonthlyGoals(skill, content);
          break;
        case 'yearlyGoals':
          content = await generateYearlyGoals(skill, experience);
          await saveYearlyGoals(skill, content);
          break;
        default:
          throw new Error('Invalid content type');
      }
      setGeneratedContent(content);
      toast({
        title: 'Success',
        description: `Your ${contentType} has been generated and saved.`,
      });
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : `Failed to generate ${contentType}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${skill}-${contentType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bolt-container relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="bolt-header mb-0">Virtual Mentor Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-white">{generationsLeft} generations left</span>
          <Button onClick={() => setShowPricing(true)} className="bolt-button">
            <Sparkles className="mr-2 h-4 w-4" />
            Get More
          </Button>
        </div>
      </div>

      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full relative">
            <Button
              onClick={() => setShowPricing(false)}
              className="absolute top-2 right-2 bolt-button"
            >
              Close
            </Button>

            <stripe-pricing-table
              pricing-table-id="prctbl_1QCueKEuRNR1WDrXMm28R1sd"
              publishable-key="pk_live_51PjoJjEuRNR1WDrXMc9opL7x2bGLn58Vx7xWSUD65DlLtGRvMENE5zZNIDTTzYHAy5NdSxsje5PCYN5HvxnIJWyP00vfdUTIkJ"
            ></stripe-pricing-table>
          </div>
        </div>
      )}

      <Card className="bolt-card">
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
          <CardDescription>
            Enter your skill and experience level to generate personalized
            content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill</Label>
            <Input
              id="skill"
              placeholder="e.g., JavaScript, Writing, UI Design"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="bolt-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level</Label>
            <Input
              id="experience"
              placeholder="e.g., Beginner, Intermediate, Advanced"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bolt-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select onValueChange={setContentType} defaultValue={contentType}>
              <SelectTrigger className="bolt-input">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learningPath">Learning Path</SelectItem>
                <SelectItem value="weeklyGoals">Weekly Goals</SelectItem>
                <SelectItem value="monthlyGoals">Monthly Goals</SelectItem>
                <SelectItem value="yearlyGoals">Yearly Goals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            className="bolt-button w-full"
            disabled={isLoading || generationsLeft === 0}
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </Button>

          {generatedContent && (
            <div className="space-y-4">
              <Textarea
                value={generatedContent}
                readOnly
                className="bolt-textarea min-h-[200px]"
              />
              <Button onClick={handleDownload} className="bolt-button w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
