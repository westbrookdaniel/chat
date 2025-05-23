import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { updateUser } from "./actions";
import { User } from "@/db";

interface ConfigureModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigureModal({ user, isOpen, onClose }: ConfigureModalProps) {
  const queryClient = useQueryClient();

  const [key, setKey] = useState(user.anthropicApiKey ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextUser = await updateUser({
      id: user.id,
      anthropicApiKey: key,
    });

    queryClient.setQueryData(["user", user.id], {
      ...user,
      ...nextUser,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your user settings</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 pt-2 pb-8">
            <Label htmlFor="key" className="text-right">
              Anthropic API Key
            </Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="col-span-3"
              type="password"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
