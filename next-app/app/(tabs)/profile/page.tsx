import { getConfig } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export const revalidate = 86400;

export default async function ProfilePage() {
  const config = await getConfig();

  return (
    <div className="py-8 md:py-12 max-w-lg mx-auto">
      {/* Bio */}
      <section className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {config.personal.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{config.personal.title}</p>
      </section>

      {/* Socials */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <a
            href={config.social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Github className="size-5 text-muted-foreground" />
            <span>github.com/{config.social.github.username}</span>
          </a>
          <Separator />
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="size-5 text-muted-foreground" />
            <span>LinkedIn</span>
          </a>
          <Separator />
          <a
            href={`mailto:${config.social.email}`}
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Mail className="size-5 text-muted-foreground" />
            <span>{config.social.email}</span>
          </a>
        </CardContent>
      </Card>

      {/* Featured */}
      {config.featured && config.featured.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Featured
          </h2>
          <div className="space-y-3">
            {config.featured.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.source}
                      </Badge>
                    </div>
                    <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
