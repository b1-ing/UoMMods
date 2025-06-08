/**
 * v0 by Vercel.
 * @see https://v0.dev/t/b8nBtqXPupB
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Component() {
    return (
        <div className="mx-auto max-w-2xl space-y-8 py-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Comments</h2>
                <div className="grid gap-2">
                    <Textarea
                        placeholder="Write your comment..."
                        className="resize-none rounded-md border border-input bg-background p-3 text-sm shadow-sm"
                    />
                    <Button className="justify-center">Submit</Button>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="font-medium">Olivia Davis</div>
                            <div className="text-xs text-muted-foreground">2 days ago</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            This is a great product! I&apos;ve been using it for a week and it&apos;s been a game-changer.
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="font-medium">Noah Williams</div>
                            <div className="text-xs text-muted-foreground">5 days ago</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            I&apos;m really impressed with the quality and performance of this product. Highly recommended!
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="font-medium">Emma Brown</div>
                            <div className="text-xs text-muted-foreground">1 week ago</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            I&apos;ve been using this product for a while and it&apos;s been consistently reliable. Definitely worth the
                            investment.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}