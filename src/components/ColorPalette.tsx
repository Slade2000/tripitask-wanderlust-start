
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ColorSwatch = ({ name, color, hexCode }: { name: string; color: string; hexCode: string }) => (
  <div className="flex flex-col items-center">
    <div 
      className="w-16 h-16 rounded-full mb-2" 
      style={{ backgroundColor: hexCode }}
    />
    <p className="font-medium">{name}</p>
    <p className="text-xs opacity-70">{hexCode}</p>
  </div>
);

export const ColorPalette = () => {
  const colors = [
    { name: "Cream", color: "bg-cream", hexCode: "#f1f0ec" },
    { name: "Teal Light", color: "bg-teal-light", hexCode: "#75b2b7" },
    { name: "Teal", color: "bg-teal", hexCode: "#0d6269" },
    { name: "Gold", color: "bg-gold", hexCode: "#f6c254" },
    { name: "Orange", color: "bg-orange", hexCode: "#ed8707" },
    { name: "Teal Dark", color: "bg-teal-dark", hexCode: "#073136" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Color Palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {colors.map((color) => (
            <ColorSwatch 
              key={color.name} 
              name={color.name} 
              color={color.color} 
              hexCode={color.hexCode} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
