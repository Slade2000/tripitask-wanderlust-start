
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ColorPalette } from "@/components/ColorPalette";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoonIcon, SunIcon } from "lucide-react";

const Index = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-12 px-4">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-primary">TripiTask</h1>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </header>
        
        <div className="space-y-8">
          <section className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Welcome to Your Travel Task Manager</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Organize your travel plans and tasks with our beautiful color-themed interface
            </p>
          </section>
          
          <ColorPalette />
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-cream text-teal-dark">
              <CardHeader>
                <CardTitle>Cream Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hexcode: #f1f0ec</p>
              </CardContent>
            </Card>
            
            <Card className="bg-teal text-cream">
              <CardHeader>
                <CardTitle>Teal Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hexcode: #0d6269</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gold text-teal-dark">
              <CardHeader>
                <CardTitle>Gold Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hexcode: #f6c254</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
