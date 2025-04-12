import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 dark">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <ShieldX className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-white">Access Denied</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-zinc-400">
          <p>Your current role doesn't have the necessary permissions to view this resource.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnauthorizedPage; 