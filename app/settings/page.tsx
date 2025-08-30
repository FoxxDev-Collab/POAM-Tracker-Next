"use client";

import React from "react";
import { Settings, Shield, Info, Palette } from "lucide-react";
import { useThemePalette, ThemePaletteId } from "@/components/ThemePaletteProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";

export default function SettingsPage() {
  const { palette, setPalette } = useThemePalette();

  return (
    <MainLayout>
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application settings and data
          </p>
        </div>
      </div>
    
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { id: "default" as ThemePaletteId, name: "Default", description: "Clean and minimal theme" },
              { id: "kodama" as ThemePaletteId, name: "Kodama", description: "Nature-inspired green theme" },
              { id: "starry-night" as ThemePaletteId, name: "Starry Night", description: "Deep blue cosmic theme" },
              { id: "bubblegum" as ThemePaletteId, name: "Bubblegum", description: "Playful pink theme" },
              { id: "doom" as ThemePaletteId, name: "Doom", description: "Dark industrial gaming theme" },
              { id: "soft-pop" as ThemePaletteId, name: "Soft Pop", description: "Vibrant modern design theme" },
              { id: "notebook" as ThemePaletteId, name: "Notebook", description: "Hand-written paper style theme" },
              { id: "cyberpunk" as ThemePaletteId, name: "Cyberpunk", description: "Neon-lit futuristic aesthetic" },
            ].map((theme) => (
              <div
                key={theme.id}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  palette === theme.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
                }`}
                onClick={() => setPalette(theme.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{theme.name}</h3>
                    {palette === theme.id && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                  
                  {/* Theme preview */}
                  <div className={`flex space-x-1 mt-3 ${theme.id !== "default" ? `theme-${theme.id}` : ""}`}>
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <div className="w-4 h-4 rounded-full bg-secondary"></div>
                    <div className="w-4 h-4 rounded-full bg-accent"></div>
                    <div className="w-4 h-4 rounded-full bg-muted"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Removed Database and Data Management sections (Tauri-specific) */}

      {/* Application Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Application:</span>
              <span className="ml-2">Nessus Compare</span>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <span className="ml-2">1.0.2</span>
            </div>
            <div>
              <span className="font-medium">Framework:</span>
              <span className="ml-2">Next.js</span>
            </div>
            <div>
              <span className="font-medium">Author:</span>
              <span className="ml-2">Jeremiah Price</span>
            </div>
            <div>
              <span className="font-medium">Creation Date:</span>
              <span className="ml-2">08/18/2025</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-amber-700">
            <p>• All data is stored locally on your device</p>
            <p>• No data is transmitted to external servers</p>
            <p>• Regular backups are recommended for important scan data</p>
            <p>• Keep your application updated for the latest security features</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </MainLayout>
  );
}
